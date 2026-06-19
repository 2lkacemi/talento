"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { clientsApi } from "@/lib/api";
import { Client } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import ClientForm from "@/components/clients/ClientForm";
import EmptyState from "@/components/ui/EmptyState";
import { Building2, Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ClientsPage() {
  const qc = useQueryClient();
  const t = useTranslations("clients");
  const tc = useTranslations("common");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: clientsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); setShowModal(false); toast.success(t("created")); },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedCreate")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => clientsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); setEditing(null); toast.success(t("updated")); },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedUpdate")),
  });

  const deleteMutation = useMutation({
    mutationFn: clientsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); toast.success(t("deleted")); },
    onError: () => toast.error(tc("failedDelete")),
  });

  function handleDelete(client: Client) {
    if (confirm(t("deleteConfirm", { name: client.name, company: client.companyName }))) {
      deleteMutation.mutate(client.id);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title={t("title")}
        subtitle={`${clients.length}`}
        action={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> {t("newClient")}
          </button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t("noClients")}
          description={t("noClientsDesc")}
          action={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus className="h-4 w-4" /> {t("newClient")}</button>}
        />
      ) : (
        <div className="card divide-y divide-gray-100">
          {clients.map((client) => (
            <div key={client.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
              <Link href={`/clients/${client.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                  {client.companyName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.companyName} · {client.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    {client.jobOffersCount === 1
                      ? t("offerCount", { n: client.jobOffersCount })
                      : t("offerCountPlural", { n: client.jobOffersCount })}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
              <div className="ml-4 flex shrink-0 items-center gap-1">
                <button onClick={() => setEditing(client)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(client)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={t("newClient")}>
        <ClientForm onSubmit={(data) => createMutation.mutateAsync(data)} loading={createMutation.isPending} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={t("editClient")}>
        {editing && (
          <ClientForm
            initial={editing}
            onSubmit={(data) => updateMutation.mutateAsync({ id: editing.id, data })}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>
    </AppShell>
  );
}
