"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { clientsApi } from "@/lib/api";
import { Client } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import ClientForm from "@/components/clients/ClientForm";
import EmptyState from "@/components/ui/EmptyState";
import {
  Building2, Plus, Pencil, Trash2, Search,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  ChevronsUpDown, SlidersHorizontal, X,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const PAGE_SIZE = 20;

const ALL_COLUMNS = [
  "company", "contact", "email", "phone", "jobOffersCount", "createdAt",
] as const;

type ColKey = (typeof ALL_COLUMNS)[number];

const DEFAULT_VISIBLE: ColKey[] = ["company", "contact", "email", "phone", "jobOffersCount"];
const ALWAYS_VISIBLE: ColKey[] = ["company"];

function loadVisibleCols(): Set<ColKey> {
  try {
    const saved = localStorage.getItem("talento_clients_cols");
    if (saved) return new Set(JSON.parse(saved) as ColKey[]);
  } catch {}
  return new Set(DEFAULT_VISIBLE);
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 text-gray-300" />;
  return dir === "asc"
    ? <ChevronUp className="ml-1 h-3.5 w-3.5 shrink-0 text-blue-500" />
    : <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 text-blue-500" />;
}

export default function ClientsPage() {
  const qc = useQueryClient();
  const t = useTranslations("clients");
  const tc = useTranslations("common");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(new Set(DEFAULT_VISIBLE));
  const [colFilters, setColFilters] = useState<Partial<Record<ColKey, string>>>({});
  const [sortCol, setSortCol] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showColPicker, setShowColPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setVisibleCols(loadVisibleCols()); }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        setShowColPicker(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["clients", page],
    queryFn: () => clientsApi.getAll(page, PAGE_SIZE),
  });

  const clients = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const createMutation = useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      setShowModal(false);
      toast.success(t("created"));
    },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedCreate")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => clientsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      setEditing(null);
      toast.success(t("updated"));
    },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedUpdate")),
  });

  const deleteMutation = useMutation({
    mutationFn: clientsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success(t("deleted"));
    },
    onError: () => toast.error(tc("failedDelete")),
  });

  const colLabel: Record<ColKey, string> = {
    company:       t("colCompany"),
    contact:       t("colContact"),
    email:         t("colEmail"),
    phone:         t("colPhone"),
    jobOffersCount:t("colOffers"),
    createdAt:     t("colAddedAt"),
  };

  const activeCols = ALL_COLUMNS.filter(
    (c) => ALWAYS_VISIBLE.includes(c) || visibleCols.has(c)
  );

  // Local search filter (client-side, on top of paginated data)
  const searchedClients = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const displayedClients = useMemo(() => {
    let result = [...searchedClients];

    for (const col of ALL_COLUMNS) {
      const f = colFilters[col]?.toLowerCase().trim();
      if (!f) continue;
      result = result.filter((c) => {
        switch (col) {
          case "company":        return c.companyName.toLowerCase().includes(f);
          case "contact":        return c.name.toLowerCase().includes(f);
          case "email":          return c.email.toLowerCase().includes(f);
          case "phone":          return (c.phone ?? "").toLowerCase().includes(f);
          case "jobOffersCount": return String(c.jobOffersCount).includes(f);
          case "createdAt":      return new Date(c.createdAt).toLocaleDateString("fr-FR").includes(f);
          default:               return true;
        }
      });
    }

    if (sortCol) {
      result.sort((a, b) => {
        let av: any, bv: any;
        switch (sortCol) {
          case "company":        av = a.companyName;      bv = b.companyName; break;
          case "contact":        av = a.name;             bv = b.name; break;
          case "email":          av = a.email;            bv = b.email; break;
          case "phone":          av = a.phone ?? "";      bv = b.phone ?? ""; break;
          case "jobOffersCount": av = a.jobOffersCount;   bv = b.jobOffersCount; break;
          case "createdAt":      av = a.createdAt;        bv = b.createdAt; break;
          default: return 0;
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchedClients, colFilters, sortCol, sortDir]);

  function handleSort(col: ColKey) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  }

  function toggleCol(col: ColKey) {
    if (ALWAYS_VISIBLE.includes(col)) return;
    setVisibleCols((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col); else next.add(col);
      localStorage.setItem("talento_clients_cols", JSON.stringify(Array.from(next)));
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
            <Plus className="h-4 w-4" /> {t("newClient")}
          </button>
        }
      />

      {isError && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Failed to load clients: {(error as any)?.response?.data?.message || (error as any)?.message || "Unknown error"}
        </div>
      )}

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
            {tc("columns")}
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
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t("noClients")}
          description={t("noClientsDesc")}
          action={
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" /> {t("newClient")}
            </button>
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
                    {tc("actions")}
                  </th>
                </tr>
                {/* Per-column filter inputs */}
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {activeCols.map((col) => (
                    <td key={col} className="px-3 py-1.5">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={tc("filterPlaceholder")}
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
                {displayedClients.length === 0 ? (
                  <tr>
                    <td colSpan={activeCols.length + 1} className="py-12 text-center text-gray-400">
                      {t("noResults")}
                    </td>
                  </tr>
                ) : (
                  displayedClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      {activeCols.map((col) => (
                        <td key={col} className="px-4 py-3 align-middle">
                          {col === "company" && (
                            <Link href={`/clients/${client.id}`} className="group flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                {client.companyName[0]}
                              </div>
                              <span className="whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {client.companyName}
                              </span>
                            </Link>
                          )}
                          {col === "contact" && (
                            <span className="whitespace-nowrap text-gray-700">{client.name}</span>
                          )}
                          {col === "email" && (
                            <a
                              href={`mailto:${client.email}`}
                              className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              {client.email}
                            </a>
                          )}
                          {col === "phone" && (
                            <span className="whitespace-nowrap text-gray-600">{client.phone || "—"}</span>
                          )}
                          {col === "jobOffersCount" && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                              {client.jobOffersCount === 1
                                ? t("offerCount", { n: client.jobOffersCount })
                                : t("offerCountPlural", { n: client.jobOffersCount })}
                            </span>
                          )}
                          {col === "createdAt" && (
                            <span className="whitespace-nowrap text-xs text-gray-500">
                              {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditing(client)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t("deleteConfirm", { name: client.name, company: client.companyName })))
                              deleteMutation.mutate(client.id);
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title={t("newClient")}>
        <ClientForm onSubmit={async (data) => { await createMutation.mutateAsync(data); }} loading={createMutation.isPending} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={t("editClient")}>
        {editing && (
          <ClientForm
            initial={editing}
            onSubmit={async (data) => { await updateMutation.mutateAsync({ id: editing.id, data }); }}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>
    </AppShell>
  );
}
