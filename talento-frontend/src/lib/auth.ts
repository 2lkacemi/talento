import { AuthResponse } from "./types";

interface StoredUser {
  email: string;
  fullName: string;
  role: string;
  agencyId: string;
  agencyName: string;
}

export function saveAuth(auth: AuthResponse) {
  localStorage.setItem("talento_token", auth.token);
  localStorage.setItem(
    "talento_user",
    JSON.stringify({
      email: auth.email,
      fullName: auth.fullName,
      role: auth.role,
      agencyId: auth.agencyId,
      agencyName: auth.agencyName,
    })
  );
}

export function clearAuth() {
  localStorage.removeItem("talento_token");
  localStorage.removeItem("talento_user");
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("talento_user");
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("talento_token");
}
