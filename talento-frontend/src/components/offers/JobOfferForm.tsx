"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { clientsApi } from "@/lib/api";
import { JobOffer } from "@/lib/types";
import { X } from "lucide-react";

interface Props {
  initial?: Partial<JobOffer>;
  defaultClientId?: string;
  onSubmit: (data: Partial<JobOffer>) => Promise<void>;
  loading?: boolean;
}

export default function JobOfferForm({ initial, defaultClientId, onSubmit, loading }: Props) {
  const t = useTranslations("offers.form");
  const tc = useTranslations("common");
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getAll });
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    clientId: initial?.clientId ?? defaultClientId ?? "",
    requiredSkills: initial?.requiredSkills ?? ([] as string[]),
    requiredExperienceYears: initial?.requiredExperienceYears ?? 0,
    location: initial?.location ?? "",
    status: initial?.status ?? ("OPEN" as JobOffer["status"]),
  });

  function addSkill() {
    const s = skillInput.trim();
    if (s && !form.requiredSkills.includes(s)) {
      setForm({ ...form, requiredSkills: [...form.requiredSkills, s] });
    }
    setSkillInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t("title")} *</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required className="input"
          placeholder={t("titlePlaceholder")}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t("client")} *</label>
        <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required className="input">
          <option value="">{t("selectClient")}</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.companyName} — {c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t("description")}</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input min-h-[100px] resize-y"
          placeholder={t("descriptionPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{t("location")}</label>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" placeholder={t("locationPlaceholder")} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{t("experience")}</label>
          <input type="number" min={0} value={form.requiredExperienceYears} onChange={(e) => setForm({ ...form, requiredExperienceYears: parseInt(e.target.value) || 0 })} className="input" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t("skills")}</label>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
            className="input flex-1"
            placeholder={t("skillsPlaceholder")}
          />
          <button type="button" onClick={addSkill} className="btn-secondary">{t("addSkill")}</button>
        </div>
        {form.requiredSkills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {form.requiredSkills.map((s) => (
              <span key={s} className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                {s}
                <button type="button" onClick={() => setForm({ ...form, requiredSkills: form.requiredSkills.filter((x) => x !== s) })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t("status")}</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as JobOffer["status"] })} className="input">
          <option value="OPEN">{t("statusOpen")}</option>
          <option value="CLOSED">{t("statusClosed")}</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? tc("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}
