"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Users, Building2, Briefcase } from "lucide-react";
import { searchApi } from "@/lib/api";

function useDebounce(value: string, ms: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debouncedValue;
}

export default function GlobalSearch() {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const { data } = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
  });

  const hasResults =
    data &&
    (data.candidates.length > 0 || data.clients.length > 0 || data.jobOffers.length > 0);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder={t("placeholder")}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {open && debouncedQuery.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          {!hasResults ? (
            <p className="px-4 py-3 text-sm text-gray-400">{t("noResults")}</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {data!.candidates.length > 0 && (
                <Section
                  icon={<Users className="h-3.5 w-3.5" />}
                  label={t("candidates")}
                  items={data!.candidates.map((c) => ({
                    key: c.id,
                    primary: c.fullName,
                    secondary: c.email,
                    href: `/candidates/${c.id}`,
                  }))}
                  onNavigate={navigate}
                />
              )}
              {data!.clients.length > 0 && (
                <Section
                  icon={<Building2 className="h-3.5 w-3.5" />}
                  label={t("clients")}
                  items={data!.clients.map((c) => ({
                    key: c.id,
                    primary: c.companyName,
                    secondary: c.name,
                    href: `/clients/${c.id}`,
                  }))}
                  onNavigate={navigate}
                />
              )}
              {data!.jobOffers.length > 0 && (
                <Section
                  icon={<Briefcase className="h-3.5 w-3.5" />}
                  label={t("jobOffers")}
                  items={data!.jobOffers.map((o) => ({
                    key: o.id,
                    primary: o.title,
                    secondary: o.clientCompanyName,
                    href: `/offers/${o.id}`,
                  }))}
                  onNavigate={navigate}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  label,
  items,
  onNavigate,
}: {
  icon: React.ReactNode;
  label: string;
  items: { key: string; primary: string; secondary: string; href: string }[];
  onNavigate: (href: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-50">
        {icon}
        {label}
      </div>
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onNavigate(item.href)}
          className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-blue-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900">{item.primary}</span>
          <span className="text-xs text-gray-500">{item.secondary}</span>
        </button>
      ))}
    </div>
  );
}
