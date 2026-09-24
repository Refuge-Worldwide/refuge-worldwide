import { serialize as serializeCookie } from "cookie";

// Structural type rather than NextApiResponse so this works for both API
// route handlers and getServerSideProps' `res`, which have slightly
// different (but compatible) types for setHeader.
type ResponseLike = { setHeader(name: string, value: string | string[]): void };

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

if (!directusUrl) {
  throw new Error("NEXT_PUBLIC_DIRECTUS_URL is not set");
}

const ACCESS_COOKIE = "directus_session_token";
const REFRESH_COOKIE = "directus_refresh_token";

interface DirectusTokens {
  access_token: string;
  refresh_token: string;
  expires: number; // ms until access token expiry
}

export function setSessionCookies(res: ResponseLike, tokens: DirectusTokens) {
  const isProd = process.env.NODE_ENV === "production";

  res.setHeader("Set-Cookie", [
    serializeCookie(ACCESS_COOKIE, tokens.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(tokens.expires / 1000),
    }),
    serializeCookie(REFRESH_COOKIE, tokens.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      // Directus refresh tokens default to a 7 day lifetime.
      maxAge: 60 * 60 * 24 * 7,
    }),
  ]);
}

export function clearSessionCookies(res: ResponseLike) {
  res.setHeader("Set-Cookie", [
    serializeCookie(ACCESS_COOKIE, "", { path: "/", maxAge: 0 }),
    serializeCookie(REFRESH_COOKIE, "", { path: "/", maxAge: 0 }),
  ]);
}

type CookieSource = { cookies: Partial<Record<string, string>> };

const DEFAULT_FIELDS = "id,email,first_name";

async function fetchMe(accessToken: string, fields: string) {
  return fetch(`${directusUrl}/users/me?fields=${fields}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

async function refreshTokens(
  refreshToken: string
): Promise<DirectusTokens | null> {
  const response = await fetch(`${directusUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "json", refresh_token: refreshToken }),
  });

  if (!response.ok) return null;
  const { data } = await response.json();
  return data as DirectusTokens;
}

/**
 * Resolves a valid Directus access token from the session cookies,
 * transparently refreshing an expired one once before giving up. For use by
 * API routes that need to call Directus with the caller's own permissions
 * (e.g. reading/writing their own show_favourites) rather than an admin
 * token.
 */
export async function getValidAccessToken(
  req: CookieSource,
  res: ResponseLike
): Promise<string | null> {
  const accessToken = req.cookies[ACCESS_COOKIE];
  const refreshToken = req.cookies[REFRESH_COOKIE];

  if (!accessToken) return null;

  let probe: Response;
  try {
    probe = await fetch(`${directusUrl}/users/me?fields=id`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Network error talking to Directus — don't punish the user for our
    // own infra hiccup by logging them out; trust the existing cookie.
    return accessToken;
  }

  if (probe.ok) return accessToken;

  if (probe.status === 401 && refreshToken) {
    const tokens = await refreshTokens(refreshToken);
    if (!tokens) {
      clearSessionCookies(res);
      return null;
    }

    setSessionCookies(res, tokens);
    return tokens.access_token;
  }

  // Anything other than a clean 401 (e.g. a transient 429/500 from Directus)
  // is inconclusive, not proof the session is invalid — fail open rather
  // than logging a real session out because of an unrelated hiccup.
  if (probe.status !== 401) return accessToken;

  return null;
}

/**
 * For use in getServerSideProps. Verifies the session against Directus
 * itself (never trusts the cookie value alone), transparently refreshing an
 * expired access token once before giving up. Pass `fields` to request more
 * than the default id/email/name — e.g. the account page also wants
 * subscription_status and the stripe_* fields.
 */
export async function getSessionUser(
  req: CookieSource,
  res: ResponseLike,
  fields: string = DEFAULT_FIELDS
) {
  const accessToken = req.cookies[ACCESS_COOKIE];
  const refreshToken = req.cookies[REFRESH_COOKIE];

  if (!accessToken) return null;

  let response: Response | null;
  try {
    response = await fetchMe(accessToken, fields);
  } catch {
    response = null;
  }

  if (response?.status === 401 && refreshToken) {
    const tokens = await refreshTokens(refreshToken);
    if (!tokens) {
      clearSessionCookies(res);
      return null;
    }
    setSessionCookies(res, tokens);
    try {
      response = await fetchMe(tokens.access_token, fields);
    } catch {
      response = null;
    }
  }

  if (response && !response.ok && response.status !== 401) {
    // Transient error (e.g. a rate-limited 429, or a momentary 5xx) rather
    // than proof the session is invalid — retry once before giving up,
    // instead of treating a genuinely signed-in user as logged out.
    try {
      response = await fetchMe(accessToken, fields);
    } catch {
      response = null;
    }
  }

  if (!response || !response.ok) return null;

  const { data } = await response.json();
  return data as Record<string, any>;
}

export { directusUrl };
