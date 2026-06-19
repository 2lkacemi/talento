import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // cookies() is synchronous in Next.js 14
  const cookieStore = cookies();
  const raw = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = raw === "fr" ? "fr" : "en";

  const messages =
    locale === "fr"
      ? (await import("../../messages/fr.json")).default
      : (await import("../../messages/en.json")).default;

  return { locale, messages };
});
