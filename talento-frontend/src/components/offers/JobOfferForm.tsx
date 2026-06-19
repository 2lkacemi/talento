"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  function removeSkill(skill: string) {
    setForm({ ...form, requiredSkills: form.requiredSkills.filter((s) => s !== skill) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          className="input"
          placeholder="Senior React Developer"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Client *</label>
        <select
          value={form.clientId}
          onChange={(e) => setForm({ ...form, clientId: e.target.value })}
          required
          className="input"
        >
          <option value="">Select a client…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.companyName} — {c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input min-h-[100px] resize-y"
          placeholder="Describe the role and responsibilities…"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
            placeholder="Paris, France"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Min. experience (years)</label>
          <input
            type="number"
            min={0}
            value={form.requiredExperienceYears}
            onChange={(e) => setForm({ ...form, requiredExperienceYears: parseInt(e.target.value) || 0 })}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Required skills</label>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
            className="input flex-1"
            placeholder="React, Java, Python…"
          />
          <button type="button" onClick={addSkill} className="btn-secondary">Add</button>
        </div>
        {form.requiredSkills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {form.requiredSkills.map((s) => (
              <span key={s} className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                {s}
                <button type="button" onClick={() => removeSkill(s)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as JobOffer["status"] })} className="input">
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Save offer"}
        </button>
      </div>
    </form>
  );
}
