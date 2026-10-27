import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createApiMocks } from "../helpers/createApiMocks";
import {
  directusSessionResponse,
  sessionToken,
} from "../helpers/directusSession";
import loginHandler from "@/pages/api/auth/login";
import logoutHandler from "@/pages/api/auth/logout";
import meHandler from "@/pages/api/auth/me";
import { getSessionUser } from "@/lib/directus/session";
import { getUserAccess } from "@/lib/directus/staff";

// Partial-mock so login/logout keep using the real session helpers, while me.ts gets a mockable getSessionUser.
vi.mock("@/lib/directus/session", async () => ({
  ...(await vi.importActual<typeof import("@/lib/directus/session")>(
    "@/lib/directus/session"
  )),
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/directus/staff", () => ({ getUserAccess: vi.fn() }));

const mockGetSessionUser = getSessionUser as Mock;
const mockGetUserAccess = getUserAccess as Mock;

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
    const token = sessionToken();
    (global.fetch as Mock).mockResolvedValueOnce(
      directusSessionResponse(token)
    );
    const { req, res } = createApiMocks({
      body: { email: "a@b.com", password: "correct" },
    });
    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      `${DIRECTUS_URL}/auth/login`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "a@b.com",
          password: "correct",
          mode: "session",
        }),
      })
    );
    expect(res.getHeader("Set-Cookie")).toContain(
      `directus_session_token=${token}`
    );
  });
});

describe("POST /api/auth/logout", () => {
  it("rejects non-POST methods", async () => {
    const { req, res } = createApiMocks({ method: "GET" });
    await logoutHandler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("clears the cookie even when there's no session", async () => {
    const { req, res } = createApiMocks({ cookies: {} });
    await logoutHandler(req, res);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    expect(res.getHeader("Set-Cookie")).toContain("directus_session_token=;");
  });

  it("ends the Directus session and clears the cookie", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true });
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: "session-1" },
    });
    await logoutHandler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      `${DIRECTUS_URL}/auth/logout`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ mode: "session" }),
        headers: expect.objectContaining({
          Cookie: "directus_session_token=session-1",
        }),
      })
    );
    expect(res._getStatusCode()).toBe(200);
  });

  it("still clears the cookie and succeeds if the Directus call fails", async () => {
    (global.fetch as Mock).mockRejectedValueOnce(new Error("network down"));
    const { req, res } = createApiMocks({
      cookies: { directus_session_token: "session-1" },
    });
    await logoutHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res.getHeader("Set-Cookie")).toContain("directus_session_token=;");
  });
});

describe("GET /api/auth/me", () => {
  it("returns the session user when logged in", async () => {
    mockGetSessionUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com" });
    mockGetUserAccess.mockResolvedValueOnce({
      isStaff: false,
      hasSupporterAccess: true,
    });
    const { req, res } = createApiMocks({ method: "GET" });
    await meHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      user: { id: "u1", email: "a@b.com" },
      isStaff: false,
      hasSupporterAccess: true,
    });
  });

  it("flags staff users", async () => {
    mockGetSessionUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com" });
    mockGetUserAccess.mockResolvedValueOnce({ isStaff: true });
    const { req, res } = createApiMocks({ method: "GET" });
    await meHandler(req, res);

    expect(res._getJSONData()).toMatchObject({ isStaff: true });
  });

  it("still returns the user if the staff lookup fails", async () => {
    mockGetSessionUser.mockResolvedValueOnce({ id: "u1", email: "a@b.com" });
    mockGetUserAccess.mockRejectedValueOnce(new Error("directus down"));
    const { req, res } = createApiMocks({ method: "GET" });
    await meHandler(req, res);

    expect(res._getJSONData()).toEqual({
      user: { id: "u1", email: "a@b.com" },
      isStaff: false,
      hasSupporterAccess: false,
    });
  });

  it("returns a null user when logged out", async () => {
    mockGetSessionUser.mockResolvedValueOnce(null);
    const { req, res } = createApiMocks({ method: "GET" });
    await meHandler(req, res);

    expect(res._getJSONData()).toEqual({
      user: null,
      isStaff: false,
      hasSupporterAccess: false,
      retry: false,
    });
  });

  it("asks the client to retry when a session cookie is still there", async () => {
    mockGetSessionUser.mockResolvedValueOnce(null);
    const { req, res } = createApiMocks({
      method: "GET",
      cookies: { directus_session_token: "session-1" },
    });
    await meHandler(req, res);

    expect(res._getJSONData()).toMatchObject({ user: null, retry: true });
  });
});
