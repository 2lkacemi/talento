"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { dashboardApi, jobOffersApi } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import StatCard from "@/components/ui/StatCard";
import { Users, Briefcase, Building2, TrendingUp, CheckCircle, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.getStats,
  });
  const { data: offersPage } = useQuery({
    queryKey: ["job-offers-recent"],
    queryFn: () => jobOffersApi.getAll(0, 5),
  });
  const offers = offersPage?.content ?? [];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-28 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label={t("totalCandidates")}    value={stats?.totalCandidates ?? 0}    icon={Users}        color="blue" />
          <StatCard label={t("totalJobOffers")}     value={stats?.totalJobOffers ?? 0}     icon={Briefcase}    color="indigo" />
          <StatCard label={t("openJobOffers")}      value={stats?.openJobOffers ?? 0}      icon={TrendingUp}   color="green" />
          <StatCard label={t("clients")}            value={stats?.totalClients ?? 0}        icon={Building2}    color="purple" />
          <StatCard label={t("activeApplications")} value={stats?.activeApplications ?? 0} icon={Activity}     color="orange" />
          <StatCard label={t("hired")}              value={stats?.hiredThisMonth ?? 0}     icon={CheckCircle}  color="teal" />
        </div>
      )}

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t("recentOffers")}</h2>
          <Link href="/offers" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            {t("viewAll")}
          </Link>
        </div>
        <div className="card divide-y divide-gray-100">
          {offers.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-gray-500">{t("noOffers")}</p>
          )}
          {offers.map((offer) => (
            <Link
              key={offer.id}
              href={`/offers/${offer.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors sm:px-6 sm:py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{offer.title}</p>
                <p className="truncate text-sm text-gray-500">{offer.clientCompanyName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <span className="hidden text-sm text-gray-500 sm:inline">{offer.applicationsCount} {t("apps")}</span>
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
