"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi, jobOffersApi, applicationsApi } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import StatCard from "@/components/ui/StatCard";
import { Users, Briefcase, Building2, TrendingUp, CheckCircle, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.getStats,
  });

  const { data: offers = [] } = useQuery({
    queryKey: ["job-offers"],
    queryFn: jobOffersApi.getAll,
  });

  const recentOffers = offers.slice(0, 5);

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your recruitment pipeline</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-28 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Total Candidates" value={stats?.totalCandidates ?? 0} icon={Users} color="blue" />
          <StatCard label="Job Offers" value={stats?.totalJobOffers ?? 0} icon={Briefcase} color="indigo" />
          <StatCard label="Open Offers" value={stats?.openJobOffers ?? 0} icon={TrendingUp} color="green" />
          <StatCard label="Clients" value={stats?.totalClients ?? 0} icon={Building2} color="purple" />
          <StatCard label="Active Applications" value={stats?.activeApplications ?? 0} icon={Activity} color="orange" />
          <StatCard label="Hired" value={stats?.hiredThisMonth ?? 0} icon={CheckCircle} color="teal" />
        </div>
      )}

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Job Offers</h2>
          <Link href="/offers" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
        <div className="card divide-y divide-gray-100">
          {recentOffers.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-gray-500">No job offers yet.</p>
          )}
          {recentOffers.map((offer) => (
            <Link
              key={offer.id}
              href={`/offers/${offer.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{offer.title}</p>
                <p className="text-sm text-gray-500">{offer.clientCompanyName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{offer.applicationsCount} apps</span>
                <span className={offer.status === "OPEN" ? "badge-open" : "badge-closed"}>
                  {offer.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
