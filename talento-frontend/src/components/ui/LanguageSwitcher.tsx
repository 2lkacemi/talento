"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const LOCALES = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
];

export default function LanguageSwitcher() {
  const t = useTranslations("common");
  const current = useLocale();
  const router = useRouter();

  function setLocale(locale: string) {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
      {LOCALES.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => code !== current && setLocale(code)}
          title={t("language")}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            current === code
              ? "bg-white shadow text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
