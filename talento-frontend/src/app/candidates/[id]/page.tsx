"use client";

import { useQuery } from "@tanstack/react-query";
import { candidatesApi } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import SkillTag from "@/components/ui/SkillTag";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Briefcase, ExternalLink } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-yellow-100 text-yellow-700",
  CLIENT_INTERVIEW: "bg-orange-100 text-orange-700",
  OFFER: "bg-purple-100 text-purple-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const { data: candidate, isLoading } = useQuery({
    queryKey: ["candidate", params.id],
    queryFn: () => candidatesApi.getById(params.id),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["candidate-applications", params.id],
    queryFn: () => candidatesApi.getApplications(params.id),
    enabled: !!candidate,
  });

  if (isLoading) return <AppShell><div className="card h-64 animate-pulse bg-gray-100" /></AppShell>;
  if (!candidate) return <AppShell><p>Candidate not found</p></AppShell>;

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/candidates" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to candidates
        </Link>
      </div>

      <div className="card mb-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-700">
            {candidate.firstName[0]}{candidate.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{candidate.fullName}</h1>
            <p className="text-gray-500">{candidate.location} · {candidate.experienceYears} years experience</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <a href={`mailto:${candidate.email}`} className="hover:text-blue-600 transition-colors truncate">{candidate.email}</a>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" /> {candidate.phone}
            </div>
          )}
          {candidate.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" /> {candidate.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-gray-400 shrink-0" /> {candidate.experienceYears} years experience
          </div>
        </div>

        {candidate.cvUrl && (
          <a href={candidate.cvUrl} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
            <ExternalLink className="h-4 w-4" /> View CV
          </a>
        )}

        {candidate.skills.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-gray-700">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((s) => <SkillTag key={s} label={s} />)}
            </div>
          </div>
        )}

        {candidate.languages.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700">Languages</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.languages.map((l) => (
                <span key={l} className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">{l}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-900">Application History</h2>
      <div className="card divide-y divide-gray-100">
        {applications.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-gray-500">No applications yet.</p>
        )}
        {applications.map((app) => (
          <Link key={app.id} href={`/offers/${app.jobOfferId}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="font-medium text-gray-900">{app.jobOfferTitle}</p>
                <p className="text-sm text-gray-500">{app.clientName}</p>
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status] || "bg-gray-100 text-gray-700"}`}>
              {app.status.replace("_", " ")}
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
