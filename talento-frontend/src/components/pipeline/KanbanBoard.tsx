"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";
import { applicationsApi } from "@/lib/api";
import { Application, ApplicationStatus } from "@/lib/types";
import { GripVertical, Star } from "lucide-react";
import clsx from "clsx";

const COLUMN_IDS: ApplicationStatus[] = [
  "NEW", "CONTACTED", "INTERVIEW", "CLIENT_INTERVIEW", "OFFER", "HIRED", "REJECTED",
];

const COLUMN_COLORS: Record<ApplicationStatus, string> = {
  NEW: "bg-gray-100 border-gray-300",
  CONTACTED: "bg-blue-50 border-blue-200",
  INTERVIEW: "bg-yellow-50 border-yellow-200",
  CLIENT_INTERVIEW: "bg-orange-50 border-orange-200",
  OFFER: "bg-purple-50 border-purple-200",
  HIRED: "bg-green-50 border-green-200",
  REJECTED: "bg-red-50 border-red-200",
};

function ApplicationCard({ application }: { application: Application }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: application.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="group rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-0.5 shrink-0 cursor-grab rounded p-0.5 text-gray-400 opacity-0 group-hover:opacity-100 active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{application.candidateName}</p>
          <p className="truncate text-xs text-gray-500">{application.candidateEmail}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {application.score}
            </span>
            {application.notes && (
              <span className="truncate text-xs text-gray-400" title={application.notes}>
                {application.notes.slice(0, 30)}…
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  label,
  applications,
}: {
  status: ApplicationStatus;
  label: string;
  applications: Application[];
}) {
  return (
    <div className={clsx("flex w-72 shrink-0 flex-col rounded-xl border-2 p-3", COLUMN_COLORS[status])}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 shadow-sm">
          {applications.length}
        </span>
      </div>
      <SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-[4rem]">
          {applications.map((app) => <ApplicationCard key={app.id} application={app} />)}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ jobOfferId }: { jobOfferId: string }) {
  const qc = useQueryClient();
  const t = useTranslations("pipeline");
  const [activeApp, setActiveApp] = useState<Application | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications", "job-offer", jobOfferId],
    queryFn: () => applicationsApi.getByJobOffer(jobOfferId),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      applicationsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications", "job-offer", jobOfferId] }),
    onError: () => toast.error(t("failedUpdate")),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onDragStart(event: DragStartEvent) {
    setActiveApp(applications.find((a) => a.id === event.active.id) ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveApp(null);
    const { active, over } = event;
    if (!over) return;
    const draggedApp = applications.find((a) => a.id === active.id);
    if (!draggedApp) return;
    const targetStatus = (COLUMN_IDS.includes(over.id as ApplicationStatus)
      ? over.id
      : applications.find((a) => a.id === over.id)?.status) as ApplicationStatus | undefined;
    if (targetStatus && targetStatus !== draggedApp.status) {
      updateStatus.mutate({ id: draggedApp.id, status: targetStatus });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const grouped = Object.fromEntries(COLUMN_IDS.map((s) => [s, [] as Application[]])) as Record<ApplicationStatus, Application[]>;
  for (const app of applications) {
    if (grouped[app.status]) grouped[app.status].push(app);
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMN_IDS.map((status) => (
          <KanbanColumn key={status} status={status} label={t(status)} applications={grouped[status]} />
        ))}
      </div>
      <DragOverlay>
        {activeApp && (
          <div className="rotate-2 rounded-lg border border-gray-200 bg-white p-3 shadow-xl opacity-90">
            <p className="text-sm font-semibold text-gray-900">{activeApp.candidateName}</p>
            <p className="text-xs text-gray-500">{activeApp.candidateEmail}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
