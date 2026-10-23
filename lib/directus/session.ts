import { parse as parseCookie, serialize as serializeCookie } from "cookie";

// Structural type rather than NextApiResponse so this works for both API
// route handlers and getServerSideProps' `res`, which have slightly
// different (but compatible) types for setHeader.
type ResponseLike = { setHeader(name: string, value: string | string[]): void };

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

if (!directusUrl) {
  throw new Error("NEXT_PUBLIC_DIRECTUS_URL is not set");
}

// session mode, not json, so parallel refreshes get Directus's grace period
const SESSION_COOKIE = "directus_session_token";

function decodeToken(token: string): { iat: number; exp: number } | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    );
    return typeof payload.iat === "number" && typeof payload.exp === "number"
      ? payload
      : null;
  } catch {
    return null;
  }
}

function setSessionCookie(res: ResponseLike, token: string) {
  const exp = decodeToken(token)?.exp;
  res.setHeader(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(exp && { maxAge: Math.max(0, exp - Math.floor(Date.now() / 1000)) }),
    })
  );
}

export function clearSessionCookies(res: ResponseLike) {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE, "", { path: "/", maxAge: 0 })
  );
}

function sessionTokenFrom(directusResponse: Response): string | null {
  for (const header of directusResponse.headers.getSetCookie()) {
    const token = parseCookie(header)[SESSION_COOKIE];
    if (token) return token;
  }
  return null;
}

export async function loginWithPassword(
  email: string,
  password: string,
  res: ResponseLike
): Promise<boolean> {
  const response = await fetch(`${directusUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, mode: "session" }),
  });
  if (!response.ok) return false;

  const token = sessionTokenFrom(response);
  if (!token) return false;
  setSessionCookie(res, token);
  return true;
}

export async function logoutSession(req: CookieSource) {
  const token = req.cookies[SESSION_COOKIE];
  if (!token) return;
  await fetch(`${directusUrl}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: serializeCookie(SESSION_COOKIE, token),
    },
    body: JSON.stringify({ mode: "session" }),
  });
}

async function refreshSession(
  token: string,
  res: ResponseLike
): Promise<string | null> {
  try {
    const response = await fetch(`${directusUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: serializeCookie(SESSION_COOKIE, token),
      },
      body: JSON.stringify({ mode: "session" }),
    });
    if (!response.ok) return null;

    const fresh = sessionTokenFrom(response);
    if (!fresh) return null;
    setSessionCookie(res, fresh);
    return fresh;
  } catch {
    return null;
  }
}

type CookieSource = {
  cookies: Partial<Record<string, string>>;
  headers?: { authorization?: string };
};

// The app has no session cookie, it sends its Directus token as a Bearer header
function bearerToken(req: CookieSource): string | undefined {
  const header = req.headers?.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : undefined;
}

// Directus won't refresh an expired token, so refresh at half its lifetime
export async function getValidAccessToken(
  req: CookieSource,
  res: ResponseLike
): Promise<string | null> {
  const token = req.cookies[SESSION_COOKIE];
  if (!token) return null;

  const times = decodeToken(token);
  if (!times) return token;

  const now = Date.now() / 1000;
  if (times.exp <= now) return null;

  if (now - times.iat > (times.exp - times.iat) / 2) {
    return (await refreshSession(token, res)) ?? token;
  }
  return token;
}

const DEFAULT_FIELDS = "id,email,first_name";

async function fetchMe(accessToken: string, fields: string) {
  try {
    return await fetch(`${directusUrl}/users/me?fields=${fields}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    return null;
  }
}

/**
 * Verifies the session against Directus itself (never trusts the cookie
 * alone). Pass `fields` to request more than the default id/email/name.
 */
export async function getSessionUser(
  req: CookieSource,
  res: ResponseLike,
  fields: string = DEFAULT_FIELDS
) {
  const accessToken = (await getValidAccessToken(req, res)) ?? bearerToken(req);
  if (!accessToken) return null;

  let response = await fetchMe(accessToken, fields);

  // a 429/5xx isn't proof the session is invalid, so try once more
  if (response && !response.ok && response.status !== 401) {
    response = await fetchMe(accessToken, fields);
  }

  if (!response || !response.ok) return null;

  const { data } = await response.json();
  return data as Record<string, any>;
}

export { SESSION_COOKIE, directusUrl };
