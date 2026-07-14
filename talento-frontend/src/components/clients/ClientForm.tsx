"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Client } from "@/lib/types";

interface Props {
  initial?: Partial<Client>;
  onSubmit: (data: Omit<Client, "id" | "createdAt" | "jobOffersCount">) => Promise<void>;
  loading?: boolean;
}

export default function ClientForm({ initial, onSubmit, loading }: Props) {
  const t = useTranslations("clients.form");
  const tc = useTranslations("common");
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    companyName: initial?.companyName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{t("contactName")} *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input" placeholder={t("contactPlaceholder")} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{t("company")} *</label>
          <input name="companyName" value={form.companyName} onChange={handleChange} required className="input" placeholder={t("companyPlaceholder")} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t("email")} *</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required className="input" placeholder={t("emailPlaceholder")} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t("phone")}</label>
        <input name="phone" value={form.phone} onChange={handleChange} className="input" placeholder={t("phonePlaceholder")} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? tc("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}
