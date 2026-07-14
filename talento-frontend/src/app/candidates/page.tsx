"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
import {
  Users, Plus, Pencil, Trash2, Search,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  ChevronsUpDown, SlidersHorizontal, X,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const PAGE_SIZE = 20;

const ALL_COLUMNS = [
  "name", "email", "phone", "location",
  "experienceYears", "skills", "languages",
  "applicationsCount", "createdAt",
] as const;

type ColKey = (typeof ALL_COLUMNS)[number];

const DEFAULT_VISIBLE: ColKey[] = [
  "name", "email", "location", "experienceYears", "skills", "applicationsCount",
];

const ALWAYS_VISIBLE: ColKey[] = ["name"];

function loadVisibleCols(): Set<ColKey> {
  try {
    const saved = localStorage.getItem("talento_candidates_cols");
    if (saved) return new Set(JSON.parse(saved) as ColKey[]);
  } catch {}
  return new Set(DEFAULT_VISIBLE);
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 shrink-0 text-gray-300" />;
  return dir === "asc"
    ? <ChevronUp className="h-3.5 w-3.5 ml-1 shrink-0 text-blue-500" />
    : <ChevronDown className="h-3.5 w-3.5 ml-1 shrink-0 text-blue-500" />;
}

export default function CandidatesPage() {
  const qc = useQueryClient();
  const t = useTranslations("candidates");
  const tc = useTranslations("common");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);

  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(new Set(DEFAULT_VISIBLE));
  const [colFilters, setColFilters] = useState<Partial<Record<ColKey, string>>>({});
  const [sortCol, setSortCol] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showColPicker, setShowColPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setVisibleCols(loadVisibleCols()); }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { setPage(0); }, [debouncedSearch]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        setShowColPicker(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["candidates", debouncedSearch, page],
    queryFn: () => candidatesApi.getAll(page, PAGE_SIZE, debouncedSearch || undefined),
  });

  const candidates = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const createMutation = useMutation({
    mutationFn: candidatesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      setShowModal(false);
      toast.success(t("created"));
    },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedCreate")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => candidatesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      setEditing(null);
      toast.success(t("updated"));
    },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedUpdate")),
  });

  const deleteMutation = useMutation({
    mutationFn: candidatesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      toast.success(t("deleted"));
    },
    onError: () => toast.error(tc("failedDelete")),
  });

  const colLabel: Record<ColKey, string> = {
    name: t("colName"),
    email: t("colEmail"),
    phone: t("colPhone"),
    location: t("colLocation"),
    experienceYears: t("colExperience"),
    skills: t("colSkills"),
    languages: t("colLanguages"),
    applicationsCount: t("colApplications"),
    createdAt: t("colAddedAt"),
  };

  const activeCols = ALL_COLUMNS.filter(
    (c) => ALWAYS_VISIBLE.includes(c) || visibleCols.has(c)
  );

  const displayedCandidates = useMemo(() => {
    let result = [...candidates];

    for (const col of ALL_COLUMNS) {
      const f = colFilters[col]?.toLowerCase().trim();
      if (!f) continue;
      result = result.filter((c) => {
        switch (col) {
          case "name":           return c.fullName.toLowerCase().includes(f);
          case "email":          return c.email.toLowerCase().includes(f);
          case "phone":          return (c.phone ?? "").toLowerCase().includes(f);
          case "location":       return (c.location ?? "").toLowerCase().includes(f);
          case "experienceYears":return String(c.experienceYears).includes(f);
          case "skills":         return c.skills.some((s) => s.toLowerCase().includes(f));
          case "languages":      return c.languages.some((l) => l.toLowerCase().includes(f));
          case "applicationsCount": return String(c.applicationsCount).includes(f);
          case "createdAt":      return new Date(c.createdAt).toLocaleDateString("fr-FR").includes(f);
          default:               return true;
        }
      });
    }

    if (sortCol) {
      result.sort((a, b) => {
        let av: any, bv: any;
        switch (sortCol) {
          case "name":           av = a.fullName;           bv = b.fullName; break;
          case "email":          av = a.email;              bv = b.email; break;
          case "phone":          av = a.phone ?? "";        bv = b.phone ?? ""; break;
          case "location":       av = a.location ?? "";     bv = b.location ?? ""; break;
          case "experienceYears":av = a.experienceYears;    bv = b.experienceYears; break;
          case "skills":         av = a.skills.length;      bv = b.skills.length; break;
          case "languages":      av = a.languages.length;   bv = b.languages.length; break;
          case "applicationsCount": av = a.applicationsCount; bv = b.applicationsCount; break;
          case "createdAt":      av = a.createdAt;          bv = b.createdAt; break;
          default: return 0;
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [candidates, colFilters, sortCol, sortDir]);

  function handleSort(col: ColKey) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  }

  function toggleCol(col: ColKey) {
    if (ALWAYS_VISIBLE.includes(col)) return;
    setVisibleCols((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col); else next.add(col);
      localStorage.setItem("talento_candidates_cols", JSON.stringify([...next]));
      return next;
    });
  }

  const activeFilterCount = Object.values(colFilters).filter(Boolean).length;

  return (
    <AppShell>
      <PageHeader
        title={t("title")}
        subtitle={`${totalElements}`}
        action={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> {t("newCandidate")}
          </button>
        }
      />

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>

        {/* Column visibility picker */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowColPicker((v) => !v)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              showColPicker
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("columns")}
            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
              {activeCols.length}
            </span>
          </button>

          {showColPicker && (
            <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
              {ALL_COLUMNS.map((col) => {
                const always = ALWAYS_VISIBLE.includes(col);
                const checked = always || visibleCols.has(col);
                return (
                  <label
                    key={col}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm select-none transition-colors ${
                      always ? "cursor-default text-gray-400" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={always}
                      onChange={() => toggleCol(col)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    {colLabel[col]}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={() => setColFilters({})}
            className="flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700 hover:bg-orange-100 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            {tc("clearFilters")} ({activeFilterCount})
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("noCandidates")}
          description={search ? t("noResults") : t("noCandidatesDesc")}
          action={
            !search ? (
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4" /> {t("newCandidate")}
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                {/* Sort headers */}
                <tr className="border-b border-gray-200 bg-gray-50">
                  {activeCols.map((col) => (
                    <th key={col} className="px-4 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">
                      <button
                        onClick={() => handleSort(col)}
                        className="flex items-center hover:text-gray-900 transition-colors"
                      >
                        {colLabel[col]}
                        <SortIcon active={sortCol === col} dir={sortDir} />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-right font-semibold text-gray-600 whitespace-nowrap">
                    {t("colActions")}
                  </th>
                </tr>
                {/* Per-column filter inputs */}
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {activeCols.map((col) => (
                    <td key={col} className="px-3 py-1.5">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t("filterPlaceholder")}
                          value={colFilters[col] ?? ""}
                          onChange={(e) =>
                            setColFilters((prev) => ({ ...prev, [col]: e.target.value }))
                          }
                          className="w-full min-w-[80px] rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        {colFilters[col] && (
                          <button
                            onClick={() => setColFilters((p) => ({ ...p, [col]: "" }))}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  ))}
                  <td />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={activeCols.length + 1} className="py-12 text-center text-gray-400">
                      {t("noResults")}
                    </td>
                  </tr>
                ) : (
                  displayedCandidates.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      {activeCols.map((col) => (
                        <td key={col} className="px-4 py-3 align-middle">
                          {col === "name" && (
                            <Link href={`/candidates/${c.id}`} className="group flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                                {c.firstName[0]}{c.lastName[0]}
                              </div>
                              <span className="whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {c.fullName}
                              </span>
                            </Link>
                          )}
                          {col === "email" && (
                            <a
                              href={`mailto:${c.email}`}
                              className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              {c.email}
                            </a>
                          )}
                          {col === "phone" && (
                            <span className="whitespace-nowrap text-gray-600">{c.phone || "—"}</span>
                          )}
                          {col === "location" && (
                            <span className="whitespace-nowrap text-gray-600">{c.location || "—"}</span>
                          )}
                          {col === "experienceYears" && (
                            <span className="whitespace-nowrap text-gray-700">
                              {tc("expYears", { n: c.experienceYears })}
                            </span>
                          )}
                          {col === "skills" && (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {c.skills.slice(0, 3).map((s) => <SkillTag key={s} label={s} />)}
                              {c.skills.length > 3 && (
                                <span className="text-xs text-gray-400">+{c.skills.length - 3}</span>
                              )}
                            </div>
                          )}
                          {col === "languages" && (
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {c.languages.slice(0, 3).map((l) => (
                                <span key={l} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                  {l}
                                </span>
                              ))}
                              {c.languages.length > 3 && (
                                <span className="text-xs text-gray-400">+{c.languages.length - 3}</span>
                              )}
                            </div>
                          )}
                          {col === "applicationsCount" && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                              {c.applicationsCount}
                            </span>
                          )}
                          {col === "createdAt" && (
                            <span className="whitespace-nowrap text-xs text-gray-500">
                              {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditing(c)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(tc("deleteConfirm", { name: c.fullName })))
                              deleteMutation.mutate(c.id);
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                {tc("previous")}
              </button>
              <span className="text-sm text-gray-500">
                {tc("pageOf", { current: page + 1, total: totalPages })}
              </span>
              <button
                disabled={data?.last}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {tc("next")}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
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
