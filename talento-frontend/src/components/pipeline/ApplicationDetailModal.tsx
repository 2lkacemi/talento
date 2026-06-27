"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { applicationsApi } from "@/lib/api";
import { Application, ApplicationStatus, StatusHistoryEntry } from "@/lib/types";
import { X, Star, User, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  NEW: "bg-gray-100 text-gray-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-yellow-100 text-yellow-700",
  CLIENT_INTERVIEW: "bg-orange-100 text-orange-700",
  OFFER: "bg-purple-100 text-purple-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

interface Props {
  application: Application | null;
  jobOfferId: string;
  onClose: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ApplicationDetailModal({ application, jobOfferId, onClose }: Props) {
  const qc = useQueryClient();
  const t = useTranslations("pipeline");
  const [notes, setNotes] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);

  useEffect(() => {
    if (application) {
      setNotes(application.notes ?? "");
      setNotesDirty(false);
    }
  }, [application?.id]);

  const { data: history = [] } = useQuery<StatusHistoryEntry[]>({
    queryKey: ["application-history", application?.id],
    queryFn: () => applicationsApi.getHistory(application!.id),
    enabled: !!application,
  });

  const saveNotes = useMutation({
    mutationFn: () => applicationsApi.updateNotes(application!.id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications", "job-offer", jobOfferId] });
      setNotesDirty(false);
      toast.success(t("notesSaved"));
    },
    onError: () => toast.error(t("failedUpdate")),
  });

  if (!application) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {initials(application.candidateName)}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{application.candidateName}</h2>
              <p className="text-sm text-gray-500">{application.candidateEmail}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Status + score */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", STATUS_COLORS[application.status])}>
              {t(application.status)}
            </span>
            {application.score > 0 && (
              <span className="flex items-center gap-1 text-sm text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium">{application.score}</span>
                <span className="text-gray-400">{t("matchScore")}</span>
              </span>
            )}
          </div>

          {/* Link to candidate profile */}
          <Link
            href={`/candidates/${application.candidateId}`}
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <User className="h-4 w-4" />
            {t("viewCandidate")}
          </Link>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t("notes")}</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setNotesDirty(true); }}
              placeholder={t("notesPlaceholder")}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {notesDirty && (
              <button
                onClick={() => saveNotes.mutate()}
                disabled={saveNotes.isPending}
                className="mt-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {saveNotes.isPending ? t("saving") : t("saveNotes")}
              </button>
            )}
          </div>

          {/* Status history */}
          {history.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-700">{t("statusHistory")}</h3>
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Clock className="h-3 w-3 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-sm">
                        {entry.fromStatus && (
                          <>
                            <span className={clsx("rounded px-1.5 py-0.5 text-xs font-medium", STATUS_COLORS[entry.fromStatus])}>
                              {t(entry.fromStatus)}
                            </span>
                            <ArrowRight className="h-3 w-3 shrink-0 text-gray-400" />
                          </>
                        )}
                        <span className={clsx("rounded px-1.5 py-0.5 text-xs font-medium", STATUS_COLORS[entry.toStatus])}>
                          {t(entry.toStatus)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(entry.changedAt).toLocaleString("fr-FR")}
                      </p>
                      {entry.notes && (
                        <p className="mt-1 text-xs italic text-gray-600">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
