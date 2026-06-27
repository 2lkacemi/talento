"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { jobOffersApi } from "@/lib/api";
import api from "@/lib/api";
import { X, CheckCircle, MapPin, Clock, Briefcase } from "lucide-react";
import SkillTag from "@/components/ui/SkillTag";
import CvUpload from "@/components/ui/CvUpload";
import toast from "react-hot-toast";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

interface PublicForm {
  firstName: string; lastName: string; email: string; phone: string;
  location: string; experienceYears: number; skills: string[]; languages: string[]; cvUrl: string;
}

export default function ApplyPage({ params }: { params: { jobOfferId: string } }) {
  const t = useTranslations("apply");
  const tc = useTranslations("common");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [form, setForm] = useState<PublicForm>({
    firstName: "", lastName: "", email: "", phone: "",
    location: "", experienceYears: 0, skills: [], languages: [], cvUrl: "",
  });

  const { data: offer, isLoading: offerLoading } = useQuery({
    queryKey: ["offer-public", params.jobOfferId],
    queryFn: () => jobOffersApi.getPublic(params.jobOfferId),
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
    setLoading(true);
    try {
      const { data: candidate } = await api.post("/candidates/public", form);
      await api.post("/applications/public", { candidateId: candidate.id, jobOfferId: params.jobOfferId });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("failed"));
    } finally {
      setLoading(false);
    }
  }

  if (offerLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">{t("notAvailable")}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900">{t("successTitle")}</h2>
          <p className="mt-2 text-gray-600">{t("successMessage", { title: offer.title })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-2 flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          <p className="text-sm text-gray-500">{offer.clientCompanyName}</p>
        </div>

        <div className="card mb-6 p-6">
          <h1 className="text-xl font-bold text-gray-900">{offer.title}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            {offer.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />{offer.location}</span>}
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" />{tc("yearsExp", { n: offer.requiredExperienceYears })}</span>
            <span className={`flex items-center gap-1.5 ${offer.status === "OPEN" ? "text-green-600" : "text-gray-400"}`}>
              <Briefcase className="h-4 w-4" />{offer.status === "OPEN" ? tc("open") : tc("closed")}
            </span>
          </div>
          {offer.description && <p className="mt-4 text-sm text-gray-600">{offer.description}</p>}
          {offer.requiredSkills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {offer.requiredSkills.map((s) => <SkillTag key={s} label={s} />)}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">{t("formTitle")}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("form.firstName")} *</label>
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className="input" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("form.lastName")} *</label>
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className="input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("form.email")} *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("form.phone")}</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("form.location")}</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" placeholder={t("form.locationPlaceholder")} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("form.experience")}</label>
                <input type="number" min={0} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: parseInt(e.target.value) || 0 })} className="input" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t("form.skills")}</label>
              <div className="flex gap-2">
                <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag("skills", skillInput); setSkillInput(""); } }} className="input flex-1" placeholder={t("form.skillsPlaceholder")} />
                <button type="button" onClick={() => { addTag("skills", skillInput); setSkillInput(""); }} className="btn-secondary">{t("form.add")}</button>
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
              <label className="mb-1 block text-sm font-medium text-gray-700">{t("form.languages")}</label>
              <div className="flex gap-2">
                <input value={langInput} onChange={(e) => setLangInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag("languages", langInput); setLangInput(""); } }} className="input flex-1" placeholder={t("form.languagesPlaceholder")} />
                <button type="button" onClick={() => { addTag("languages", langInput); setLangInput(""); }} className="btn-secondary">{t("form.add")}</button>
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
              <label className="mb-1 block text-sm font-medium text-gray-700">{t("form.cvUpload")}</label>
              <CvUpload
                value={form.cvUrl}
                onChange={(url) => setForm({ ...form, cvUrl: url })}
                labels={{
                  upload: t("form.cvUploadBtn"),
                  uploading: t("form.cvUploading"),
                  replace: t("form.cvReplace"),
                  view: t("form.cvView"),
                  uploadError: t("form.cvUploadError"),
                }}
              />
            </div>

            <button type="submit" disabled={loading || offer.status === "CLOSED"} className="btn-primary w-full justify-center">
              {loading ? t("submitting") : offer.status === "CLOSED" ? t("closed") : t("submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
