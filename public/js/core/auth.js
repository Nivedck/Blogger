import { api } from "./api.js";

let session = null;
let hasLoadedSession = false;

export async function getSession(force = false) {
  if (hasLoadedSession && !force) return session;

  const { ok, data } = await api("/api/auth/me");
  session = ok ? data.user : null;
  hasLoadedSession = true;
  return session;
}

export async function requireSession(redirectTo = "/login.html") {
  const user = await getSession();
  if (!user) {
    window.location.href = redirectTo;
    return null;
  }
  return user;
}

export async function requireAdmin(redirectTo = "/") {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    window.location.href = redirectTo;
    return null;
  }
  return user;
}

export function clearSession() {
  session = null;
  hasLoadedSession = true;
}
