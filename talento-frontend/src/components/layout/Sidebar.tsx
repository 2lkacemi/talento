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
  UsersRound,
  X,
} from "lucide-react";
import clsx from "clsx";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const navItems = [
    { href: "/dashboard",  label: t("dashboard"),  icon: LayoutDashboard },
    { href: "/clients",    label: t("clients"),    icon: Building2 },
    { href: "/offers",     label: t("offers"),     icon: Briefcase },
    { href: "/candidates", label: t("candidates"), icon: Users },
    ...(user?.role === "ADMIN" ? [{ href: "/team", label: t("team"), icon: UsersRound }] : []),
  ];

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-30 flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out",
        "md:relative md:translate-x-0",
        open ? "translate-x-0 shadow-xl" : "-translate-x-full"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-sm font-bold text-white">T</span>
        </div>
        <span className="text-lg font-bold text-gray-900">Talento</span>
        <button
          onClick={onClose}
          className="ml-auto rounded-lg p-1 text-gray-400 hover:bg-gray-100 transition-colors md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === href || pathname.startsWith(href + "/")
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

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-200 p-4 space-y-3">
        <LanguageSwitcher />
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <UserCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user?.fullName}</p>
            <p className="truncate text-xs text-gray-500">{user?.role}</p>
            {user?.agencyName && (
              <p className="truncate text-xs text-gray-400">{user.agencyName}</p>
            )}
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
