import toast from "react-hot-toast";
import {
  clearStoredToken,
  getStoredToken,
  redirectToContentfulAuth,
} from "./oauth";

let redirecting = false;

export function handleContentfulAuthExpired() {
  if (redirecting) return;
  redirecting = true;
  clearStoredToken();
  toast.error("Your Contentful session has expired, signing you in again");
  setTimeout(() => {
    redirectToContentfulAuth({
      clientId: process.env.NEXT_PUBLIC_CONTENTFUL_OAUTH_CLIENT_ID!,
    });
  }, 1500);
}

// contentful-management names the error after Contentful's sys.id
export function isContentfulAuthError(error: any) {
  return (
    error?.name === "AccessTokenInvalid" ||
    /"status": 401/.test(error?.message ?? "")
  );
}

// For /api/admin/* routes, which check the caller's Contentful token.
export async function adminFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) handleContentfulAuthExpired();
  return response;
}
