"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import toast from "react-hot-toast";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = await authApi.login(form.email, form.password);
      saveAuth(auth);
      toast.success(t("welcomeBack", { name: auth.fullName }));
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("failed"));
    } finally {
      setLoading(false);
    }
  }

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
          <p className="mt-2 text-gray-600">{t("tagline")}</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t("email")}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder={t("emailPlaceholder")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t("password")}</label>
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
              {loading ? t("submitting") : t("submitLogin")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t("noAgencyYet")}{" "}
            <Link href="/register-agency" className="font-medium text-blue-600 hover:text-blue-700">
              {t("createAgency")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
