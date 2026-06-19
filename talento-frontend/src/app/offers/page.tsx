"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobOffersApi } from "@/lib/api";
import { JobOffer } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import JobOfferForm from "@/components/offers/JobOfferForm";
import EmptyState from "@/components/ui/EmptyState";
import SkillTag from "@/components/ui/SkillTag";
import { Briefcase, Plus, Pencil, Trash2, ChevronRight, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function OffersPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<JobOffer | null>(null);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["job-offers"],
    queryFn: jobOffersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: jobOffersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["job-offers"] }); setShowModal(false); toast.success("Job offer created"); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => jobOffersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["job-offers"] }); setEditing(null); toast.success("Updated"); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: jobOffersApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["job-offers"] }); toast.success("Deleted"); },
    onError: () => toast.error("Failed to delete"),
  });

  const filtered = offers.filter((o) => filter === "ALL" || o.status === filter);

  return (
    <AppShell>
      <PageHeader
        title="Job Offers"
        subtitle={`${offers.length} total`}
        action={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> New offer
          </button>
        }
      />

      <div className="mb-6 flex gap-2">
        {(["ALL", "OPEN", "CLOSED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-36 animate-pulse bg-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job offers"
          action={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus className="h-4 w-4" /> New offer</button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((offer) => (
            <div key={offer.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="mb-3 flex items-start justify-between gap-2">
                <Link href={`/offers/${offer.id}`} className="group">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{offer.title}</h3>
                  <p className="text-sm text-gray-500">{offer.clientCompanyName}</p>
                </Link>
                <span className={offer.status === "OPEN" ? "badge-open shrink-0" : "badge-closed shrink-0"}>{offer.status}</span>
              </div>
              <div className="mb-3 flex flex-wrap gap-3 text-xs text-gray-500">
                {offer.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{offer.location}</span>}
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{offer.requiredExperienceYears}y exp</span>
                <span>{offer.applicationsCount} applications</span>
              </div>
              {offer.requiredSkills.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {offer.requiredSkills.slice(0, 4).map((s) => <SkillTag key={s} label={s} />)}
                  {offer.requiredSkills.length > 4 && <span className="text-xs text-gray-400">+{offer.requiredSkills.length - 4}</span>}
                </div>
              )}
              <div className="flex items-center justify-between">
                <Link href={`/offers/${offer.id}`} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View pipeline <ChevronRight className="h-4 w-4" />
                </Link>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(offer)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => { if (confirm("Delete this offer?")) deleteMutation.mutate(offer.id); }} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New job offer" size="lg">
        <JobOfferForm onSubmit={(d) => createMutation.mutateAsync(d)} loading={createMutation.isPending} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit job offer" size="lg">
        {editing && (
          <JobOfferForm
            initial={editing}
            onSubmit={(d) => updateMutation.mutateAsync({ id: editing.id, data: d })}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>
    </AppShell>
  );
}
