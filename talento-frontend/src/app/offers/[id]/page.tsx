"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { jobOffersApi, applicationsApi } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import KanbanBoard from "@/components/pipeline/KanbanBoard";
import SkillTag from "@/components/ui/SkillTag";
import {
  ArrowDown, ArrowLeft, ArrowUp, ArrowUpDown, Banknote,
  CheckCircle, Clock, Lock, LockOpen, MapPin, Plus, Search, Star, Users,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import clsx from "clsx";

type Tab = "pipeline" | "matched";
type SortField = "score" | "name" | "experience";

function SortIndicator({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: "asc" | "desc" }) {
  if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />;
  return sortDir === "asc"
    ? <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
    : <ArrowDown className="h-3.5 w-3.5 text-blue-600" />;
}

export default function OfferDetailPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient();
  const t = useTranslations("offers");
  const tc = useTranslations("common");
  const [tab, setTab] = useState<Tab>("pipeline");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: offer, isLoading } = useQuery({
    queryKey: ["job-offer", params.id],
    queryFn: () => jobOffersApi.getById(params.id),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["applications", "job-offer", params.id],
    queryFn: () => applicationsApi.getByJobOffer(params.id),
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
      toast.success(t("addToPipeline"));
    },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedCreate")),
  });

  const toggleStatus = useMutation({
    mutationFn: () =>
      jobOffersApi.update(params.id, {
        title: offer!.title,
        description: offer!.description,
        clientId: offer!.clientId,
        requiredSkills: offer!.requiredSkills,
        requiredLanguages: offer!.requiredLanguages,
        requiredExperienceYears: offer!.requiredExperienceYears,
        location: offer!.location,
        salary: offer!.salary,
        openPositions: offer!.openPositions,
        status: offer!.status === "OPEN" ? "CLOSED" : "OPEN",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-offer", params.id] });
      qc.invalidateQueries({ queryKey: ["job-offers"] });
      toast.success(t("updated"));
    },
    onError: () => toast.error(tc("failedUpdate")),
  });

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  }

  const filteredRanked = ranked
    .filter(({ candidate }) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        candidate.fullName.toLowerCase().includes(q) ||
        candidate.email.toLowerCase().includes(q) ||
        (candidate.location || "").toLowerCase().includes(q) ||
        candidate.skills.some((s) => s.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortField === "score") diff = a.matchScore - b.matchScore;
      if (sortField === "name") diff = a.candidate.fullName.localeCompare(b.candidate.fullName);
      if (sortField === "experience") diff = a.candidate.experienceYears - b.candidate.experienceYears;
      return sortDir === "desc" ? -diff : diff;
    });

  if (isLoading) return <AppShell><div className="card h-64 animate-pulse bg-gray-100" /></AppShell>;
  if (!offer) return <AppShell><p className="text-gray-500">{t("notFound")}</p></AppShell>;

  const hired = applications.filter((a) => a.status === "HIRED").length;
  const total = offer.openPositions > 0 ? offer.openPositions : 1;
  const pct = Math.min(100, Math.round((hired / total) * 100));

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/offers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("backTo")}
        </Link>
      </div>

      <div className="card mb-6 p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{offer.title}</h1>
            <p className="text-gray-500">
              <Link href={`/clients/${offer.clientId}`} className="hover:text-blue-600 transition-colors">
                {offer.clientCompanyName}
              </Link>{" "}
              · {offer.clientName}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={offer.status === "OPEN" ? "badge-open" : "badge-closed"}>
            {offer.status === "OPEN" ? tc("open") : tc("closed")}
          </span>
            <button
              onClick={() => toggleStatus.mutate()}
              disabled={toggleStatus.isPending}
              className={clsx(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                offer.status === "OPEN"
                  ? "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100"
                  : "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
              )}
            >
              {offer.status === "OPEN"
                ? <><Lock className="h-3.5 w-3.5" />{t("closeOffer")}</>
                : <><LockOpen className="h-3.5 w-3.5" />{t("reopenOffer")}</>}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          {offer.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />{offer.location}</span>}
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" />{tc("yearsExp", { n: offer.requiredExperienceYears })}</span>
          {offer.salary != null && <span className="flex items-center gap-1.5"><Banknote className="h-4 w-4 text-gray-400" />{offer.salary.toLocaleString()}</span>}
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-gray-400" />{applications.length}</span>
        </div>

        {/* Hiring progress */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{t("hiringProgress")}</span>
            <span className="text-gray-500">{hired} / {total} {t("positions")}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={clsx(
                "h-full rounded-full transition-all duration-500",
                pct >= 100 ? "bg-green-500" : pct >= 50 ? "bg-blue-500" : "bg-blue-400"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {offer.description && <p className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">{offer.description}</p>}

        {offer.requiredSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {offer.requiredSkills.map((s) => <SkillTag key={s} label={s} />)}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link href={`/apply/${offer.id}`} target="_blank" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            {t("publicLink")}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-6">
          {(["pipeline", "matched"] as Tab[]).map((tab_) => (
            <button
              key={tab_}
              onClick={() => setTab(tab_)}
              className={clsx(
                "border-b-2 pb-3 text-sm font-medium transition-colors",
                tab === tab_
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab_ === "pipeline" ? t("tabPipeline") : t("tabMatched")}
            </button>
          ))}
        </nav>
      </div>

      {tab === "pipeline" && <KanbanBoard jobOfferId={params.id} />}

      {tab === "matched" && (
        <div>
          {/* Search bar */}
          <div className="mb-4 relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchCandidates")}
              className="input w-full pl-9"
            />
          </div>

          {rankedLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : filteredRanked.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-400">{t("noMatches")}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3">
                      <button onClick={() => toggleSort("name")} className="flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900">
                        {t("colCandidate")} <SortIndicator field="name" sortField={sortField} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-600">{t("colLocation")}</th>
                    <th className="px-4 py-3">
                      <button onClick={() => toggleSort("experience")} className="flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900">
                        {t("colExperience")} <SortIndicator field="experience" sortField={sortField} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-600">{t("colSkills")}</th>
                    <th className="px-4 py-3">
                      <button onClick={() => toggleSort("score")} className="flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900">
                        {t("colScore")} <SortIndicator field="score" sortField={sortField} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRanked.map(({ candidate, matchScore, alreadyApplied }) => (
                    <tr key={candidate.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/candidates/${candidate.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {candidate.fullName}
                        </Link>
                        <p className="text-xs text-gray-400">{candidate.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{candidate.location || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{tc("expYears", { n: candidate.experienceYears })}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((s) => <SkillTag key={s} label={s} />)}
                          {candidate.skills.length > 3 && (
                            <span className="text-xs text-gray-400">+{candidate.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {matchScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {alreadyApplied ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                            <CheckCircle className="h-4 w-4" /> {t("inPipeline")}
                          </span>
                        ) : (
                          <button
                            onClick={() => applyMutation.mutate(candidate.id)}
                            disabled={applyMutation.isPending}
                            className="btn-secondary text-xs"
                          >
                            <Plus className="h-3.5 w-3.5" /> {t("addToPipeline")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
