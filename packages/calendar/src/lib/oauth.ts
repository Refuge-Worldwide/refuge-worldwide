import type { ContentfulOAuthConfig } from "../config";

const STORAGE_KEY = "contentful_oauth_token";
const STORAGE_EXPIRY_KEY = "contentful_oauth_token_expiry";

const CONTENTFUL_AUTH_URL = "https://be.contentful.com/oauth/authorize";

/**
 * Resolves the redirect URI for the OAuth flow.
 * Uses the explicitly configured value if provided, otherwise falls back to
 * the current page URL (origin + pathname) — works automatically across
 * local dev (any port/tunnel), staging, and production with no config needed.
 */
export function resolveRedirectUri(oauthConfig: ContentfulOAuthConfig): string {
  if (oauthConfig.redirectUri) return oauthConfig.redirectUri;
  if (typeof window === "undefined") return "";
  return window.location.origin + window.location.pathname;
}

/**
 * Builds the Contentful OAuth 2.0 authorization URL.
 * Uses the implicit grant flow (response_type=token) — no server required.
 */
export function buildAuthUrl(oauthConfig: ContentfulOAuthConfig): string {
  const params = new URLSearchParams({
    response_type: "token",
    client_id: oauthConfig.clientId,
    redirect_uri: resolveRedirectUri(oauthConfig),
    scope: oauthConfig.scope ?? "content_management_manage",
  });
  return `${CONTENTFUL_AUTH_URL}?${params.toString()}`;
}

/**
 * Redirects the browser to Contentful's OAuth login page.
 * Call this when no valid token exists.
 */
export function redirectToContentfulAuth(
  oauthConfig: ContentfulOAuthConfig
): void {
  window.location.href = buildAuthUrl(oauthConfig);
}

/**
 * Parses the OAuth callback hash fragment from the URL.
 * Contentful redirects back with: #access_token=...&token_type=Bearer&expires_in=86400
 *
 * Returns the parsed token data, or null if the hash doesn't contain a token.
 */
export function parseCallbackHash(hash: string): {
  accessToken: string;
  expiresIn: number;
} | null {
  if (!hash || !hash.includes("access_token")) return null;

  // Strip leading '#' and parse as URLSearchParams
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const expiresIn = parseInt(params.get("expires_in") ?? "86400", 10);

  if (!accessToken) return null;
  return { accessToken, expiresIn };
}

/**
 * Persists the OAuth token and its expiry timestamp to localStorage.
 * We store the absolute expiry time (unix ms) so we can check it on the
 * next page load without knowing when the token was originally issued.
 */
export function storeToken(accessToken: string, expiresIn: number): void {
  if (typeof window === "undefined") return;
  const expiresAt = Date.now() + expiresIn * 1000;
  localStorage.setItem(STORAGE_KEY, accessToken);
  localStorage.setItem(STORAGE_EXPIRY_KEY, String(expiresAt));
}

/**
 * Retrieves a stored OAuth token if one exists and hasn't expired.
 * Returns null if there is no token or if it has expired.
 *
 * A 5-minute buffer is applied so we don't use a token that's about to expire.
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(STORAGE_KEY);
  const expiryStr = localStorage.getItem(STORAGE_EXPIRY_KEY);

  if (!token || !expiryStr) return null;

  const expiresAt = parseInt(expiryStr, 10);
  const fiveMinutesMs = 5 * 60 * 1000;

  if (Date.now() + fiveMinutesMs > expiresAt) {
    // Token expired or about to expire — clean up
    clearStoredToken();
    return null;
  }

  return token;
}

/**
 * Returns how many seconds until the stored token expires.
 * Returns 0 if no token is stored or it has already expired.
 */
export function getTokenTTL(): number {
  if (typeof window === "undefined") return 0;
  const expiryStr = localStorage.getItem(STORAGE_EXPIRY_KEY);
  if (!expiryStr) return 0;
  const remaining = parseInt(expiryStr, 10) - Date.now();
  return Math.max(0, Math.floor(remaining / 1000));
}

/**
 * Removes the stored OAuth token and expiry from localStorage.
 */
export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_EXPIRY_KEY);
}

/**
 * Cleans the OAuth hash fragment from the URL without triggering a page reload.
 * Call this after successfully parsing the token so the hash isn't bookmarked.
 */
export function cleanUrlHash(): void {
  if (typeof window === "undefined") return;
  const url = window.location.href.split("#")[0];
  window.history.replaceState(null, "", url);
}
