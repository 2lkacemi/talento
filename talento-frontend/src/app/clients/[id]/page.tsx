"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi, jobOffersApi } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import { ArrowLeft, Building2, Mail, Phone, Briefcase, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import JobOfferForm from "@/components/offers/JobOfferForm";
import toast from "react-hot-toast";
import { JobOffer } from "@/lib/types";

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient();
  const [showOfferModal, setShowOfferModal] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", params.id],
    queryFn: () => clientsApi.getById(params.id),
  });

  const { data: offers = [] } = useQuery({
    queryKey: ["client-offers", params.id],
    queryFn: () => clientsApi.getJobOffers(params.id),
  });

  const createOfferMutation = useMutation({
    mutationFn: jobOffersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["client-offers", params.id] }); setShowOfferModal(false); toast.success("Job offer created"); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to create offer"),
  });

  if (isLoading) return <AppShell><div className="animate-pulse h-64 card bg-gray-100" /></AppShell>;
  if (!client) return <AppShell><p>Client not found</p></AppShell>;

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/clients" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to clients
        </Link>
      </div>

      <div className="card mb-8 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700">
            {client.companyName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.companyName}</h1>
            <p className="text-gray-500">Contact: {client.name}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" /> {client.email}
          </div>
          {client.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" /> {client.phone}
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="h-4 w-4 text-gray-400" /> {offers.length} job offer{offers.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Job Offers</h2>
        <button className="btn-primary" onClick={() => setShowOfferModal(true)}>
          <Plus className="h-4 w-4" /> New offer
        </button>
      </div>

      <div className="card divide-y divide-gray-100">
        {offers.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-gray-500">No job offers yet for this client.</p>
        )}
        {offers.map((offer) => (
          <Link
            key={offer.id}
            href={`/offers/${offer.id}`}
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-900">{offer.title}</p>
              <p className="text-sm text-gray-500">{offer.location} · {offer.requiredExperienceYears}y exp</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{offer.applicationsCount} apps</span>
              <span className={offer.status === "OPEN" ? "badge-open" : "badge-closed"}>{offer.status}</span>
            </div>
          </Link>
        ))}
      </div>

      <Modal open={showOfferModal} onClose={() => setShowOfferModal(false)} title="New job offer" size="lg">
        <JobOfferForm
          defaultClientId={params.id}
          onSubmit={(data) => createOfferMutation.mutateAsync(data)}
          loading={createOfferMutation.isPending}
        />
      </Modal>
    </AppShell>
  );
}
