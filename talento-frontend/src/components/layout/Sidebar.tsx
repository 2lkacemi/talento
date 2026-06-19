"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { clearAuth, getUser } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCircle,
  LogOut,
  Building2,
} from "lucide-react";
import clsx from "clsx";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const user = getUser();

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/clients",   label: t("clients"),   icon: Building2 },
    { href: "/offers",    label: t("offers"),    icon: Briefcase },
    { href: "/candidates",label: t("candidates"),icon: Users },
  ];

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-sm font-bold text-white">T</span>
        </div>
        <span className="text-lg font-bold text-gray-900">Talento</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-4 space-y-3">
        <LanguageSwitcher />
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
            <UserCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user?.fullName}</p>
            <p className="truncate text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t("signOut")}
        </button>
      </div>
    </aside>
  );
}
