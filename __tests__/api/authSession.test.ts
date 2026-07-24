import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createApiMocks } from "../helpers/createApiMocks";
import loginHandler from "@/pages/api/auth/login";
import logoutHandler from "@/pages/api/auth/logout";
import meHandler from "@/pages/api/auth/me";
import { getSessionUser } from "@/lib/directus/session";

// Partial-mock so login/logout keep using the real setSessionCookies /
// clearSessionCookies, while me.ts gets a mockable getSessionUser.
vi.mock("@/lib/directus/session", async () => ({
  ...(await vi.importActual<typeof import("@/lib/directus/session")>(
    "@/lib/directus/session"
  )),
  getSessionUser: vi.fn(),
}));

const mockGetSessionUser = getSessionUser as Mock;

const DIRECTUS_URL = "https://directus.test";

beforeEach(() => {
  global.fetch = vi.fn();
  vi.clearAllMocks();
});

describe("POST /api/auth/login", () => {
  it("rejects non-POST methods", async () => {
    const { req, res } = createApiMocks({ method: "GET" });
    await loginHandler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("400s when email or password is missing", async () => {
    const { req, res } = createApiMocks({ body: { email: "a@b.com" } });
    await loginHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("401s on incorrect credentials", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: false });
    const { req, res } = createApiMocks({
      body: { email: "a@b.com", password: "wrong" },
    });
    await loginHandler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it("sets session cookies and returns ok on success", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          access_token: "access-1",
          refresh_token: "refresh-1",
          expires: 900_000,
        },
      }),
    });
    const { req, res } = createApiMocks({
      body: { email: "a@b.com", password: "correct" },
    });
    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      `${DIRECTUS_URL}/auth/login`,
      expect.objectContaining({ method: "POST" })
    );
    const setCookie = res.getHeader("Set-Cookie") as string[];
    expect(setCookie[0]).toContain("directus_session_token=access-1");
  });
});

describe("POST /api/auth/logout", () => {
  it("rejects non-POST methods", async () => {
    const { req, res } = createApiMocks({ method: "GET" });
    await logoutHandler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("clears cookies even when there's no refresh token", async () => {
    const { req, res } = createApiMocks({ cookies: {} });
    await logoutHandler(req, res);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    const setCookie = res.getHeader("Set-Cookie") as string[];
    expect(setCookie[0]).toContain("directus_session_token=;");
  });

  it("calls Directus logout and clears cookies when a refresh token exists", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true });
    const { req, res } = createApiMocks({
      cookies: { directus_refresh_token: "refresh-1" },
    });
    await logoutHandler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      `${DIRECTUS_URL}/auth/logout`,
      expect.objectContaining({ method: "POST" })
    );
    expect(res._getStatusCode()).toBe(200);
  });

  it("still clears cookies and succeeds if the Directus call fails", async () => {
    (global.fetch as Mock).mockRejectedValueOnce(new Error("network down"));
    const { req, res } = createApiMocks({
      cookies: { directus_refresh_token: "refresh-1" },
    });
    await logoutHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const setCookie = res.getHeader("Set-Cookie") as string[];
    expect(setCookie[0]).toContain("directus_session_token=;");
  });
});

describe("GET /api/auth/me", () => {
  it("returns the session user when logged in", async () => {
    mockGetSessionUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com" });
    const { req, res } = createApiMocks({ method: "GET" });
    await meHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      user: { id: "u1", email: "a@b.com" },
    });
  });

  it("returns a null user when logged out", async () => {
    mockGetSessionUser.mockResolvedValueOnce(null);
    const { req, res } = createApiMocks({ method: "GET" });
    await meHandler(req, res);

    expect(res._getJSONData()).toEqual({ user: null });
  });
});
