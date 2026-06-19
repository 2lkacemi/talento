"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { candidatesApi } from "@/lib/api";
import { Candidate } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import CandidateForm from "@/components/candidates/CandidateForm";
import EmptyState from "@/components/ui/EmptyState";
import SkillTag from "@/components/ui/SkillTag";
import { Users, Plus, Pencil, Trash2, Search, MapPin, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CandidatesPage() {
  const qc = useQueryClient();
  const t = useTranslations("candidates");
  const tc = useTranslations("common");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [search, setSearch] = useState("");

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["candidates", search],
    queryFn: () => (search ? candidatesApi.search(search) : candidatesApi.getAll()),
  });

  const createMutation = useMutation({
    mutationFn: candidatesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["candidates"] }); setShowModal(false); toast.success(t("created")); },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedCreate")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => candidatesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["candidates"] }); setEditing(null); toast.success(t("updated")); },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedUpdate")),
  });

  const deleteMutation = useMutation({
    mutationFn: candidatesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["candidates"] }); toast.success(t("deleted")); },
    onError: () => toast.error(tc("failedDelete")),
  });

  return (
    <AppShell>
      <PageHeader
        title={t("title")}
        subtitle={`${candidates.length}`}
        action={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> {t("newCandidate")}
          </button>
        }
      />

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("noCandidates")}
          description={search ? t("noResults") : t("noCandidatesDesc")}
          action={!search ? <button className="btn-primary" onClick={() => setShowModal(true)}><Plus className="h-4 w-4" /> {t("newCandidate")}</button> : undefined}
        />
      ) : (
        <div className="card divide-y divide-gray-100">
          {candidates.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <Link href={`/candidates/${c.id}`} className="flex flex-1 items-center gap-4 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                  {c.firstName[0]}{c.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{c.fullName}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                    <span>{c.email}</span>
                    {c.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{tc("expYears", { n: c.experienceYears })}</span>
                  </div>
                  {c.skills.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {c.skills.slice(0, 4).map((s) => <SkillTag key={s} label={s} />)}
                      {c.skills.length > 4 && <span className="text-xs text-gray-400">+{c.skills.length - 4}</span>}
                    </div>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-3 shrink-0">
                  <span className="text-sm text-gray-400">{c.applicationsCount} {t("apps")}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => setEditing(c)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => { if (confirm(tc("deleteConfirm", { name: c.fullName }))) deleteMutation.mutate(c.id); }} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={t("newCandidate")} size="lg">
        <CandidateForm onSubmit={(d) => createMutation.mutateAsync(d)} loading={createMutation.isPending} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={t("editCandidate")} size="lg">
        {editing && (
          <CandidateForm
            initial={editing}
            onSubmit={(d) => updateMutation.mutateAsync({ id: editing.id, data: d })}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>
    </AppShell>
  );
}
