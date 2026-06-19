"use client";

import { useState } from "react";
import { Candidate } from "@/lib/types";
import { X } from "lucide-react";

interface Props {
  initial?: Partial<Candidate>;
  onSubmit: (data: Partial<Candidate>) => Promise<void>;
  loading?: boolean;
}

export default function CandidateForm({ initial, onSubmit, loading }: Props) {
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [form, setForm] = useState({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    location: initial?.location ?? "",
    experienceYears: initial?.experienceYears ?? 0,
    skills: initial?.skills ?? ([] as string[]),
    languages: initial?.languages ?? ([] as string[]),
    cvUrl: initial?.cvUrl ?? "",
  });

  function addTag(field: "skills" | "languages", value: string) {
    const v = value.trim();
    if (v && !form[field].includes(v)) setForm({ ...form, [field]: [...form[field], v] });
  }

  function removeTag(field: "skills" | "languages", v: string) {
    setForm({ ...form, [field]: form[field].filter((x) => x !== v) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">First name *</label>
          <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Last name *</label>
          <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className="input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" placeholder="Paris, France" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Experience (years)</label>
          <input type="number" min={0} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: parseInt(e.target.value) || 0 })} className="input" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Skills</label>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag("skills", skillInput); setSkillInput(""); } }}
            className="input flex-1"
            placeholder="React, Java…"
          />
          <button type="button" onClick={() => { addTag("skills", skillInput); setSkillInput(""); }} className="btn-secondary">Add</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {form.skills.map((s) => (
            <span key={s} className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
              {s}<button type="button" onClick={() => removeTag("skills", s)}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Languages</label>
        <div className="flex gap-2">
          <input
            value={langInput}
            onChange={(e) => setLangInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag("languages", langInput); setLangInput(""); } }}
            className="input flex-1"
            placeholder="English, French…"
          />
          <button type="button" onClick={() => { addTag("languages", langInput); setLangInput(""); }} className="btn-secondary">Add</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {form.languages.map((l) => (
            <span key={l} className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              {l}<button type="button" onClick={() => removeTag("languages", l)}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">CV URL (optional)</label>
        <input type="url" value={form.cvUrl} onChange={(e) => setForm({ ...form, cvUrl: e.target.value })} className="input" placeholder="https://…" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Save candidate"}
        </button>
      </div>
    </form>
  );
}
