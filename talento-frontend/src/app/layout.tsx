import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import enMessages from "../../messages/en.json";
import frMessages from "../../messages/fr.json";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Talento — Recruitment CRM",
  description: "Manage clients, job offers, and candidates in one place",
};

type Locale = "en" | "fr";
const messageMap = { en: enMessages, fr: frMessages };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const rawLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = rawLocale === "fr" ? "fr" : "en";

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messageMap[locale]}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
