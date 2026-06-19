"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { applicationsApi } from "@/lib/api";
import { Application, ApplicationStatus } from "@/lib/types";
import { GripVertical, Star } from "lucide-react";
import clsx from "clsx";

const COLUMNS: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: "NEW", label: "New", color: "bg-gray-100 border-gray-300" },
  { id: "CONTACTED", label: "Contacted", color: "bg-blue-50 border-blue-200" },
  { id: "INTERVIEW", label: "Interview", color: "bg-yellow-50 border-yellow-200" },
  { id: "CLIENT_INTERVIEW", label: "Client Interview", color: "bg-orange-50 border-orange-200" },
  { id: "OFFER", label: "Offer", color: "bg-purple-50 border-purple-200" },
  { id: "HIRED", label: "Hired", color: "bg-green-50 border-green-200" },
  { id: "REJECTED", label: "Rejected", color: "bg-red-50 border-red-200" },
];

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  NEW: "bg-gray-100 text-gray-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-yellow-100 text-yellow-700",
  CLIENT_INTERVIEW: "bg-orange-100 text-orange-700",
  OFFER: "bg-purple-100 text-purple-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

function ApplicationCard({ application, isDragging }: { application: Application; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: application.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-default"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab rounded p-0.5 text-gray-400 opacity-0 group-hover:opacity-100 active:cursor-grabbing"
        >
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
  column,
  applications,
}: {
  column: (typeof COLUMNS)[number];
  applications: Application[];
}) {
  return (
    <div className={clsx("flex w-72 shrink-0 flex-col rounded-xl border-2 p-3", column.color)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{column.label}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 shadow-sm">
          {applications.length}
        </span>
      </div>
      <SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-[4rem]">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ jobOfferId }: { jobOfferId: string }) {
  const queryClient = useQueryClient();
  const [activeApp, setActiveApp] = useState<Application | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications", "job-offer", jobOfferId],
    queryFn: () => applicationsApi.getByJobOffer(jobOfferId),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      applicationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", "job-offer", jobOfferId] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onDragStart(event: DragStartEvent) {
    const app = applications.find((a) => a.id === event.active.id);
    setActiveApp(app ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveApp(null);
    const { active, over } = event;
    if (!over) return;

    const draggedApp = applications.find((a) => a.id === active.id);
    if (!draggedApp) return;

    // Determine target column: over could be a column id or a card id
    const targetColumnId = COLUMNS.find((c) => c.id === over.id)?.id
      ?? applications.find((a) => a.id === over.id)?.status;

    if (targetColumnId && targetColumnId !== draggedApp.status) {
      updateStatus.mutate({ id: draggedApp.id, status: targetColumnId });
    }
  }

  function onDragOver(event: DragOverEvent) {
    // handled in onDragEnd
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const grouped = Object.fromEntries(COLUMNS.map((c) => [c.id, [] as Application[]])) as Record<ApplicationStatus, Application[]>;
  for (const app of applications) {
    if (grouped[app.status]) grouped[app.status].push(app);
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn key={col.id} column={col} applications={grouped[col.id]} />
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
