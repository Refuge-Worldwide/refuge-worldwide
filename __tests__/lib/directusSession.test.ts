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

// Imported after vitest.setup.ts has set NEXT_PUBLIC_DIRECTUS_URL, since the
// module throws at import time if that env var is missing.
import {
  clearSessionCookies,
  getSessionUser,
  getValidAccessToken,
  setSessionCookies,
} from "@/lib/directus/session";

const DIRECTUS_URL = "https://directus.test";

function mockFetchOnce(response: Partial<Response> & { ok: boolean }) {
  (global.fetch as Mock).mockResolvedValueOnce(response as Response);
}

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── setSessionCookies / clearSessionCookies ───────────────────────────────

describe("setSessionCookies", () => {
  it("sets both cookies with the given tokens", () => {
    const { res } = createApiMocks();
    setSessionCookies(res, {
      access_token: "access-123",
      refresh_token: "refresh-456",
      expires: 900_000,
    });

    const setCookie = res.getHeader("Set-Cookie") as string[];
    expect(setCookie).toHaveLength(2);
    expect(setCookie[0]).toContain("directus_session_token=access-123");
    expect(setCookie[1]).toContain("directus_refresh_token=refresh-456");
  });

  it("marks cookies secure in production", () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = "production";

    const { res } = createApiMocks();
    setSessionCookies(res, {
      access_token: "a",
      refresh_token: "r",
      expires: 1000,
    });
    const setCookie = res.getHeader("Set-Cookie") as string[];
    expect(setCookie[0]).toContain("Secure");

    (process.env as any).NODE_ENV = originalEnv;
  });
});

describe("clearSessionCookies", () => {
  it("expires both cookies", () => {
    const { res } = createApiMocks();
    clearSessionCookies(res);

    const setCookie = res.getHeader("Set-Cookie") as string[];
    expect(setCookie[0]).toContain("directus_session_token=;");
    expect(setCookie[1]).toContain("directus_refresh_token=;");
  });
});

// ─── getSessionUser ─────────────────────────────────────────────────────────

describe("getSessionUser", () => {
  it("returns null when there's no access token cookie", async () => {
    const { req, res } = createApiMocks({ cookies: {} });
    expect(await getSessionUser(req, res)).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns the user on a successful /users/me call", async () => {
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: "valid-token" },
    });
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: "u1", email: "a@b.com" } }),
    });

    const user = await getSessionUser(req, res);
    expect(user).toEqual({ id: "u1", email: "a@b.com" });
    expect(global.fetch).toHaveBeenCalledWith(
      `${DIRECTUS_URL}/users/me?fields=id,email,first_name`,
      expect.objectContaining({
        headers: { Authorization: "Bearer valid-token" },
      })
    );
  });

  it("refreshes an expired token and retries once", async () => {
    const { req, res } = createApiMocks({
      cookies: {
        directus_session_token: "expired-token",
        directus_refresh_token: "refresh-token",
      },
    });

    // First /users/me call: 401 (expired)
    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) });
    // /auth/refresh call: succeeds with new tokens
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          access_token: "new-access",
          refresh_token: "new-refresh",
          expires: 900_000,
        },
      }),
    });
    // Retried /users/me call with the new token: succeeds
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: "u1", email: "a@b.com" } }),
    });

    const user = await getSessionUser(req, res);
    expect(user).toEqual({ id: "u1", email: "a@b.com" });

    const setCookie = res.getHeader("Set-Cookie") as string[];
    expect(setCookie[0]).toContain("directus_session_token=new-access");
  });

  it("clears cookies and returns null when the refresh token is also invalid", async () => {
    const { req, res } = createApiMocks({
      cookies: {
        directus_session_token: "expired-token",
        directus_refresh_token: "bad-refresh-token",
      },
    });

    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) });
    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) }); // refresh fails

    const user = await getSessionUser(req, res);
    expect(user).toBeNull();

    const setCookie = res.getHeader("Set-Cookie") as string[];
    expect(setCookie[0]).toContain("directus_session_token=;");
  });

  it("retries once on a transient error before giving up", async () => {
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: "valid-token" },
    });

    mockFetchOnce({ ok: false, status: 500, json: async () => ({}) }); // transient
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: "u1", email: "a@b.com" } }),
    }); // retry succeeds

    const user = await getSessionUser(req, res);
    expect(user).toEqual({ id: "u1", email: "a@b.com" });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("returns null when Directus is unreachable (network error)", async () => {
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: "valid-token" },
    });
    (global.fetch as Mock).mockRejectedValueOnce(new Error("ECONNREFUSED"));

    expect(await getSessionUser(req, res)).toBeNull();
  });
});

// ─── getValidAccessToken ────────────────────────────────────────────────────

describe("getValidAccessToken", () => {
  it("returns null when there's no access token cookie", async () => {
    const { req, res } = createApiMocks({ cookies: {} });
    expect(await getValidAccessToken(req, res)).toBeNull();
  });

  it("returns the token as-is when the probe succeeds", async () => {
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: "valid-token" },
    });
    mockFetchOnce({ ok: true, status: 200, json: async () => ({}) });

    expect(await getValidAccessToken(req, res)).toBe("valid-token");
  });

  it("fails open (keeps the existing token) on a network error probing Directus", async () => {
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: "valid-token" },
    });
    (global.fetch as Mock).mockRejectedValueOnce(new Error("network down"));

    expect(await getValidAccessToken(req, res)).toBe("valid-token");
  });

  it("fails open on a non-401 error status (e.g. a transient 500)", async () => {
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: "valid-token" },
    });
    mockFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    expect(await getValidAccessToken(req, res)).toBe("valid-token");
  });

  it("refreshes and returns the new token on a 401 with a refresh token", async () => {
    const { req, res } = createApiMocks({
      cookies: {
        directus_session_token: "expired-token",
        directus_refresh_token: "refresh-token",
      },
    });
    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) });
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          access_token: "new-access",
          refresh_token: "new-refresh",
          expires: 900_000,
        },
      }),
    });

    expect(await getValidAccessToken(req, res)).toBe("new-access");
  });

  it("clears cookies and returns null when refreshing fails", async () => {
    const { req, res } = createApiMocks({
      cookies: {
        directus_session_token: "expired-token",
        directus_refresh_token: "bad-refresh-token",
      },
    });
    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) });
    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) });

    expect(await getValidAccessToken(req, res)).toBeNull();
    const setCookie = res.getHeader("Set-Cookie") as string[];
    expect(setCookie[0]).toContain("directus_session_token=;");
  });

  it("returns null on a 401 with no refresh token available", async () => {
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: "expired-token" },
    });
    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) });

    expect(await getValidAccessToken(req, res)).toBeNull();
  });
});
