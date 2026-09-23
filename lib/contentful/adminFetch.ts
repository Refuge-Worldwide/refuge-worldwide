import { getStoredToken } from "./oauth";

// For /api/admin/* routes, which check the caller's Contentful token.
export function adminFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
