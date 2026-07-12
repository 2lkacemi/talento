"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { invitationsApi, usersApi } from "@/lib/api";
import { getUser } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { Users, Plus, Trash2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function TeamPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const t = useTranslations("team");
  const tc = useTranslations("common");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState<{ email: string; role: "ADMIN" | "RECRUITER" }>({
    email: "",
    role: "RECRUITER",
  });
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "ADMIN") {
      router.replace("/dashboard");
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  const currentUserId = getUser()?.email;

  const usersQuery = useQuery({
    queryKey: ["team-users"],
    queryFn: usersApi.getAll,
    enabled: isAdmin === true,
  });

  const invitationsQuery = useQuery({
    queryKey: ["team-invitations"],
    queryFn: invitationsApi.getAll,
    enabled: isAdmin === true,
  });

  const inviteMutation = useMutation({
    mutationFn: () => invitationsApi.create(inviteForm.email, inviteForm.role),
    onSuccess: (invitation) => {
      qc.invalidateQueries({ queryKey: ["team-invitations"] });
      setLastInviteUrl(invitation.inviteUrl ?? null);
      setInviteForm({ email: "", role: "RECRUITER" });
      toast.success(t("invited"));
    },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedCreate")),
  });

  const revokeMutation = useMutation({
    mutationFn: invitationsApi.revoke,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-invitations"] });
      toast.success(t("revoked"));
    },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedDelete")),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "ADMIN" | "RECRUITER" }) =>
      usersApi.changeRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-users"] });
      toast.success(t("roleUpdated"));
    },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedUpdate")),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      usersApi.setEnabled(id, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-users"] });
      toast.success(t("statusUpdated"));
    },
    onError: (e: any) => toast.error(e.response?.data?.message || tc("failedUpdate")),
  });

  function closeInviteModal() {
    setShowInvite(false);
    setLastInviteUrl(null);
    setCopied(false);
  }

  async function copyInviteUrl() {
    if (!lastInviteUrl) return;
    await navigator.clipboard.writeText(lastInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isAdmin !== true) {
    return (
      <AppShell>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  const users = usersQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];

  return (
    <AppShell>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <button className="btn-primary" onClick={() => setShowInvite(true)}>
            <Plus className="h-4 w-4" /> {t("inviteButton")}
          </button>
        }
      />

      <h2 className="mb-3 text-sm font-semibold text-gray-700">{t("membersTitle")}</h2>
      {users.length === 0 ? (
        <EmptyState icon={Users} title={t("noMembers")} />
      ) : (
        <div className="mb-8 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600">{t("colName")}</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600">{t("colEmail")}</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600">{t("colRole")}</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600">{t("colStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const isSelf = u.email === currentUserId;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.fullName} {isSelf && <span className="text-xs text-gray-400">({t("you")})</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          roleMutation.mutate({ id: u.id, role: e.target.value as "ADMIN" | "RECRUITER" })
                        }
                        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
                      >
                        <option value="ADMIN">{t("roleAdmin")}</option>
                        <option value="RECRUITER">{t("roleRecruiter")}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => statusMutation.mutate({ id: u.id, enabled: !u.enabled })}
                        disabled={isSelf}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          u.enabled ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {u.enabled ? t("active") : t("inactive")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold text-gray-700">{t("pendingInvitations")}</h2>
      {invitations.length === 0 ? (
        <EmptyState icon={Users} title={t("noInvitations")} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600">{t("colEmail")}</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600">{t("colRole")}</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600">{t("colStatus")}</th>
                <th className="px-4 py-2.5 text-right font-semibold text-gray-600">{tc("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-700">{inv.email}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        inv.status === "PENDING"
                          ? "bg-blue-50 text-blue-700"
                          : inv.status === "ACCEPTED"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inv.status === "PENDING" && (
                      <button
                        onClick={() => revokeMutation.mutate(inv.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showInvite} onClose={closeInviteModal} title={t("inviteButton")} size="sm">
        {lastInviteUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{t("inviteCreatedShare")}</p>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="flex-1 truncate text-xs text-gray-700">{lastInviteUrl}</span>
              <button onClick={copyInviteUrl} className="shrink-0 text-gray-500 hover:text-gray-700">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <button className="btn-secondary w-full justify-center" onClick={closeInviteModal}>
              {tc("close")}
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              inviteMutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t("colEmail")}</label>
              <input
                type="email"
                required
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t("colRole")}</label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as "ADMIN" | "RECRUITER" })}
                className="input"
              >
                <option value="RECRUITER">{t("roleRecruiter")}</option>
                <option value="ADMIN">{t("roleAdmin")}</option>
              </select>
            </div>
            <button type="submit" disabled={inviteMutation.isPending} className="btn-primary w-full justify-center">
              {inviteMutation.isPending ? tc("loading") : t("inviteButton")}
            </button>
          </form>
        )}
      </Modal>
    </AppShell>
  );
}
