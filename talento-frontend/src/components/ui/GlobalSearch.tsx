"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Users, Building2, Briefcase } from "lucide-react";
import { searchApi } from "@/lib/api";

function useDebounce(value: string, ms: number) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return dv;
}

export default function GlobalSearch() {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const { data } = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
  });

  const flatItems = useMemo(() => {
    if (!data) return [];
    return [
      ...data.candidates.map((c) => ({ key: c.id, primary: c.fullName, secondary: c.email, href: `/candidates/${c.id}` })),
      ...data.clients.map((c) => ({ key: c.id, primary: c.companyName, secondary: c.name, href: `/clients/${c.id}` })),
      ...data.jobOffers.map((o) => ({ key: o.id, primary: o.title, secondary: o.clientCompanyName, href: `/offers/${o.id}` })),
    ];
  }, [data]);

  const hasResults = flatItems.length > 0;

  useEffect(() => { setFocusedIndex(-1); }, [debouncedQuery]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    setQuery("");
    setFocusedIndex(-1);
    router.push(href);
  }, [router]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !hasResults) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, flatItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && flatItems[focusedIndex]) navigate(flatItems[focusedIndex].href);
        break;
      case "Escape":
        setOpen(false);
        setFocusedIndex(-1);
        break;
    }
  }

  const candidateItems = flatItems.filter((_, i) => i < (data?.candidates.length ?? 0));
  const clientItems = flatItems.filter((_, i) => i >= (data?.candidates.length ?? 0) && i < (data?.candidates.length ?? 0) + (data?.clients.length ?? 0));
  const offerItems = flatItems.filter((_, i) => i >= (data?.candidates.length ?? 0) + (data?.clients.length ?? 0));

  const focusedKey = focusedIndex >= 0 ? flatItems[focusedIndex]?.key : null;

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder={t("placeholder")}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {open && debouncedQuery.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
          {!hasResults ? (
            <p className="px-4 py-3 text-sm text-gray-400">{t("noResults")}</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {candidateItems.length > 0 && (
                <Section
                  icon={<Users className="h-3.5 w-3.5" />}
                  label={t("candidates")}
                  items={candidateItems}
                  focusedKey={focusedKey}
                  onNavigate={navigate}
                />
              )}
              {clientItems.length > 0 && (
                <Section
                  icon={<Building2 className="h-3.5 w-3.5" />}
                  label={t("clients")}
                  items={clientItems}
                  focusedKey={focusedKey}
                  onNavigate={navigate}
                />
              )}
              {offerItems.length > 0 && (
                <Section
                  icon={<Briefcase className="h-3.5 w-3.5" />}
                  label={t("jobOffers")}
                  items={offerItems}
                  focusedKey={focusedKey}
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
  icon, label, items, focusedKey, onNavigate,
}: {
  icon: React.ReactNode;
  label: string;
  items: { key: string; primary: string; secondary: string; href: string }[];
  focusedKey: string | null;
  onNavigate: (href: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {icon} {label}
      </div>
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onNavigate(item.href)}
          className={`flex w-full flex-col px-4 py-2.5 text-left transition-colors ${
            focusedKey === item.key ? "bg-blue-50" : "hover:bg-gray-50"
          }`}
        >
          <span className="text-sm font-medium text-gray-900">{item.primary}</span>
          <span className="text-xs text-gray-500">{item.secondary}</span>
        </button>
      ))}
    </div>
  );
}
