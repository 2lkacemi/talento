"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobOffersApi, applicationsApi, candidatesApi } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import KanbanBoard from "@/components/pipeline/KanbanBoard";
import SkillTag from "@/components/ui/SkillTag";
import Modal from "@/components/ui/Modal";
import { ArrowLeft, MapPin, Clock, Users, Star, CheckCircle, Plus } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import clsx from "clsx";

type Tab = "pipeline" | "matched";

export default function OfferDetailPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("pipeline");
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const { data: offer, isLoading } = useQuery({
    queryKey: ["job-offer", params.id],
    queryFn: () => jobOffersApi.getById(params.id),
  });

  const { data: ranked = [], isLoading: rankedLoading } = useQuery({
    queryKey: ["ranked", params.id],
    queryFn: () => jobOffersApi.getRankedCandidates(params.id),
    enabled: tab === "matched",
  });

  const applyMutation = useMutation({
    mutationFn: (candidateId: string) => applicationsApi.create(candidateId, params.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ranked", params.id] });
      qc.invalidateQueries({ queryKey: ["applications", "job-offer", params.id] });
      toast.success("Candidate added to pipeline");
      setApplyingId(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  if (isLoading) return <AppShell><div className="card h-64 animate-pulse bg-gray-100" /></AppShell>;
  if (!offer) return <AppShell><p>Offer not found</p></AppShell>;

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/offers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to offers
        </Link>
      </div>

      <div className="card mb-6 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{offer.title}</h1>
            <p className="text-gray-500">
              <Link href={`/clients/${offer.clientId}`} className="hover:text-blue-600 transition-colors">
                {offer.clientCompanyName}
              </Link>
              {" "}· {offer.clientName}
            </p>
          </div>
          <span className={offer.status === "OPEN" ? "badge-open" : "badge-closed"}>{offer.status}</span>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          {offer.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />{offer.location}</span>}
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" />{offer.requiredExperienceYears}+ years experience</span>
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-gray-400" />{offer.applicationsCount} applications</span>
        </div>

        {offer.description && (
          <p className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">{offer.description}</p>
        )}

        {offer.requiredSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {offer.requiredSkills.map((s) => <SkillTag key={s} label={s} />)}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href={`/apply/${offer.id}`}
            target="_blank"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Public application link →
          </Link>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-6">
          {(["pipeline", "matched"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                "border-b-2 pb-3 text-sm font-medium capitalize transition-colors",
                tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {t === "pipeline" ? "Kanban Pipeline" : "Matched Candidates"}
            </button>
          ))}
        </nav>
      </div>

      {tab === "pipeline" && <KanbanBoard jobOfferId={params.id} />}

      {tab === "matched" && (
        <div>
          {rankedLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {ranked.map(({ candidate, matchScore, alreadyApplied }) => (
                <div key={candidate.id} className="card flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                      {candidate.firstName[0]}{candidate.lastName[0]}
                    </div>
                    <div>
                      <Link href={`/candidates/${candidate.id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                        {candidate.fullName}
                      </Link>
                      <p className="text-sm text-gray-500">{candidate.location} · {candidate.experienceYears}y exp</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 4).map((s) => <SkillTag key={s} label={s} />)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {matchScore}
                      </div>
                      <p className="text-xs text-gray-400">match score</p>
                    </div>
                    {alreadyApplied ? (
                      <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4" /> In pipeline
                      </span>
                    ) : (
                      <button
                        onClick={() => applyMutation.mutate(candidate.id)}
                        disabled={applyMutation.isPending && applyingId === candidate.id}
                        className="btn-secondary text-xs"
                        onMouseEnter={() => setApplyingId(candidate.id)}
                      >
                        <Plus className="h-3.5 w-3.5" /> Add to pipeline
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
