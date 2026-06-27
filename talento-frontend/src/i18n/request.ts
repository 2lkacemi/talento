import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // cookies() is synchronous in Next.js 14
  const cookieStore = cookies();
  const raw = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = raw === "en" ? "en" : "fr";

  const messages =
    locale === "en"
      ? (await import("../../messages/en.json")).default
      : (await import("../../messages/fr.json")).default;

  return { locale, messages };
});
