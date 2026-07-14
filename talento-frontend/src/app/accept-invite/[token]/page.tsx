"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { authApi } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import toast from "react-hot-toast";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const t = useTranslations("acceptInvite");
  const ta = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", password: "" });

  const { data: preview, isLoading, error } = useQuery({
    queryKey: ["invitation-preview", params.token],
    queryFn: () => authApi.previewInvitation(params.token),
    retry: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = await authApi.acceptInvitation(params.token, form.fullName, form.password);
      saveAuth(auth);
      toast.success(t("success", { name: auth.agencyName }));
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || ta("failed"));
    } finally {
      setLoading(false);
    }
  }

  const status = (error as any)?.response?.status;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-2 flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Talento</h1>
        </div>

        <div className="card p-8">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {status === 410 ? t("expiredTitle") : t("invalidTitle")}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {status === 410 ? t("expiredMessage") : t("invalidMessage")}
              </p>
            </div>
          )}

          {!isLoading && preview && (
            <>
              <p className="mb-6 text-center text-gray-700">
                {t("intro", { agencyName: preview.agencyName, role: preview.role })}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{ta("fullName")}</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="input"
                    placeholder={ta("fullNamePlaceholder")}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{ta("password")}</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? ta("submitting") : t("submit")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
