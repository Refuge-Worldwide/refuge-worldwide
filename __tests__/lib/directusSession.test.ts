import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { createApiMocks } from "../helpers/createApiMocks";
import {
  directusSessionResponse,
  sessionToken,
} from "../helpers/directusSession";

// Imported after vitest.setup.ts has set NEXT_PUBLIC_DIRECTUS_URL, since the
// module throws at import time if that env var is missing.
import {
  clearSessionCookies,
  getSessionUser,
  getValidAccessToken,
  loginWithPassword,
} from "@/lib/directus/session";

const DIRECTUS_URL = "https://directus.test";
const DAY = 86_400;

function mockFetchOnce(response: Partial<Response> & { ok: boolean }) {
  (global.fetch as Mock).mockResolvedValueOnce(response as Response);
}

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── loginWithPassword / clearSessionCookies ───────────────────────────────

describe("loginWithPassword", () => {
  it("logs in with session mode and copies Directus's session cookie", async () => {
    const token = sessionToken();
    (global.fetch as Mock).mockResolvedValueOnce(
      directusSessionResponse(token)
    );
    const { res } = createApiMocks();

    expect(await loginWithPassword("a@b.com", "pw", res)).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      `${DIRECTUS_URL}/auth/login`,
      expect.objectContaining({
        body: JSON.stringify({
          email: "a@b.com",
          password: "pw",
          mode: "session",
        }),
      })
    );
    const setCookie = res.getHeader("Set-Cookie") as string;
    expect(setCookie).toContain(`directus_session_token=${token}`);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toMatch(/Max-Age=86\d{3}/);
  });

  it("returns false and sets nothing on bad credentials", async () => {
    mockFetchOnce({ ok: false, status: 401 });
    const { res } = createApiMocks();

    expect(await loginWithPassword("a@b.com", "wrong", res)).toBe(false);
    expect(res.getHeader("Set-Cookie")).toBeUndefined();
  });

  it("marks the cookie secure in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = "production";

    (global.fetch as Mock).mockResolvedValueOnce(directusSessionResponse());
    const { res } = createApiMocks();
    await loginWithPassword("a@b.com", "pw", res);
    expect(res.getHeader("Set-Cookie")).toContain("Secure");

    (process.env as any).NODE_ENV = originalEnv;
  });
});

describe("clearSessionCookies", () => {
  it("expires the session cookie", () => {
    const { res } = createApiMocks();
    clearSessionCookies(res);
    expect(res.getHeader("Set-Cookie")).toContain("directus_session_token=;");
  });
});

// ─── getValidAccessToken ────────────────────────────────────────────────────

describe("getValidAccessToken", () => {
  it("returns null when there's no session cookie", async () => {
    const { req, res } = createApiMocks({ cookies: {} });
    expect(await getValidAccessToken(req, res)).toBeNull();
  });

  it("returns a fresh token as-is without calling Directus", async () => {
    const token = sessionToken({ ageSeconds: 60 });
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: token },
    });

    expect(await getValidAccessToken(req, res)).toBe(token);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("refreshes once the token is past half its lifetime", async () => {
    const old = sessionToken({ ageSeconds: DAY * 0.6 });
    const fresh = sessionToken();
    (global.fetch as Mock).mockResolvedValueOnce(
      directusSessionResponse(fresh)
    );
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: old },
    });

    expect(await getValidAccessToken(req, res)).toBe(fresh);
    expect(global.fetch).toHaveBeenCalledWith(
      `${DIRECTUS_URL}/auth/refresh`,
      expect.objectContaining({
        body: JSON.stringify({ mode: "session" }),
        headers: expect.objectContaining({
          Cookie: `directus_session_token=${old}`,
        }),
      })
    );
    expect(res.getHeader("Set-Cookie")).toContain(
      `directus_session_token=${fresh}`
    );
  });

  it("keeps the current token if the refresh fails", async () => {
    const old = sessionToken({ ageSeconds: DAY * 0.6 });
    mockFetchOnce({ ok: false, status: 401 });
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: old },
    });

    expect(await getValidAccessToken(req, res)).toBe(old);
    expect(res.getHeader("Set-Cookie")).toBeUndefined();
  });

  it("keeps the current token if the refresh hits a network error", async () => {
    const old = sessionToken({ ageSeconds: DAY * 0.6 });
    (global.fetch as Mock).mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: old },
    });

    expect(await getValidAccessToken(req, res)).toBe(old);
  });

  it("returns null for an expired token, since Directus won't refresh it", async () => {
    const { req, res } = createApiMocks({
      cookies: {
        directus_session_token: sessionToken({ ageSeconds: DAY + 1 }),
      },
    });

    expect(await getValidAccessToken(req, res)).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ─── getSessionUser ─────────────────────────────────────────────────────────

describe("getSessionUser", () => {
  it("returns null when there's no session cookie or bearer token", async () => {
    const { req, res } = createApiMocks({ cookies: {} });
    expect(await getSessionUser(req, res)).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns the user on a successful /users/me call", async () => {
    const token = sessionToken();
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: token },
    });
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: "u1", email: "a@b.com" } }),
    });

    expect(await getSessionUser(req, res)).toEqual({
      id: "u1",
      email: "a@b.com",
    });
    expect(global.fetch).toHaveBeenCalledWith(
      `${DIRECTUS_URL}/users/me?fields=id,email,first_name`,
      expect.objectContaining({
        headers: { Authorization: `Bearer ${token}` },
      })
    );
  });

  it("uses the refreshed token when the session was due a refresh", async () => {
    const fresh = sessionToken();
    (global.fetch as Mock).mockResolvedValueOnce(
      directusSessionResponse(fresh)
    );
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: "u1" } }),
    });
    const { req, res } = createApiMocks({
      cookies: {
        directus_session_token: sessionToken({ ageSeconds: DAY * 0.6 }),
      },
    });

    expect(await getSessionUser(req, res, "id")).toEqual({ id: "u1" });
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      `${DIRECTUS_URL}/users/me?fields=id`,
      expect.objectContaining({
        headers: { Authorization: `Bearer ${fresh}` },
      })
    );
  });

  it("falls back to the app's bearer token when there's no cookie", async () => {
    const { req, res } = createApiMocks({ cookies: {} });
    req.headers.authorization = "Bearer app-token";
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: "u1" } }),
    });

    expect(await getSessionUser(req, res)).toEqual({ id: "u1" });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { Authorization: "Bearer app-token" },
      })
    );
  });

  it("returns null when Directus rejects the session", async () => {
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: sessionToken() },
    });
    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) });

    expect(await getSessionUser(req, res)).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("retries once on a transient error before giving up", async () => {
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: sessionToken() },
    });
    mockFetchOnce({ ok: false, status: 500, json: async () => ({}) });
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: "u1", email: "a@b.com" } }),
    });

    expect(await getSessionUser(req, res)).toEqual({
      id: "u1",
      email: "a@b.com",
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("returns null when Directus is unreachable (network error)", async () => {
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: sessionToken() },
    });
    (global.fetch as Mock).mockRejectedValueOnce(new Error("ECONNREFUSED"));

    expect(await getSessionUser(req, res)).toBeNull();
  });
});
