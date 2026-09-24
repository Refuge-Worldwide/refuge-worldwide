import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { updateUser } from "@directus/sdk";
import { createApiMocks } from "../helpers/createApiMocks";
import forgotPasswordHandler from "@/pages/api/auth/forgot-password";
import resetPasswordHandler from "@/pages/api/auth/reset-password";
import changePasswordHandler from "@/pages/api/auth/change-password";
import { getValidAccessToken } from "@/lib/directus/session";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import { findUserByEmail } from "@/lib/membership";

vi.mock("@/lib/directus/session", async () => ({
  ...(await vi.importActual<typeof import("@/lib/directus/session")>(
    "@/lib/directus/session"
  )),
  getValidAccessToken: vi.fn(),
}));

vi.mock("@/lib/directus/admin", () => ({
  directusMembershipAdmin: { request: vi.fn() },
}));

vi.mock("@/lib/membership", () => ({
  findUserByEmail: vi.fn(),
}));

vi.mock("@directus/sdk", () => ({
  updateUser: vi.fn((id, data) => ({ __op: "updateUser", id, data })),
}));

const mockGetValidAccessToken = getValidAccessToken as Mock;
const mockAdminRequest = directusMembershipAdmin.request as Mock;
const mockFindUserByEmail = findUserByEmail as Mock;
const DIRECTUS_URL = "https://directus.test";

beforeEach(() => {
  global.fetch = vi.fn();
  vi.clearAllMocks();
  mockFindUserByEmail.mockResolvedValue(null); // default: skip status promotion
});

describe("POST /api/auth/forgot-password", () => {
  it("rejects non-POST methods", async () => {
    const { req, res } = createApiMocks({ method: "GET" });
    await forgotPasswordHandler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("400s when email is missing", async () => {
    const { req, res } = createApiMocks({ body: {} });
    await forgotPasswordHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("always responds ok, even when the Directus request fails", async () => {
    (global.fetch as Mock).mockRejectedValueOnce(new Error("down"));
    const { req, res } = createApiMocks({ body: { email: "a@b.com" } });
    await forgotPasswordHandler(req, res);

    // Deliberately doesn't leak whether the email exists — always 200.
    expect(res._getStatusCode()).toBe(200);
  });

  it("requests a reset with the correct reset_url", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true });
    const { req, res } = createApiMocks({ body: { email: "a@b.com" } });
    await forgotPasswordHandler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      `${DIRECTUS_URL}/auth/password/request`,
      expect.objectContaining({
        body: JSON.stringify({
          email: "a@b.com",
          reset_url: "https://refugeworldwide.test/reset-password",
        }),
      })
    );
    expect(res._getStatusCode()).toBe(200);
  });
});

describe("POST /api/auth/reset-password", () => {
  it("400s when token or password is missing", async () => {
    const { req, res } = createApiMocks({ body: { token: "t" } });
    await resetPasswordHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("400s when the password is too short", async () => {
    const { req, res } = createApiMocks({
      body: { token: "t", password: "short" },
    });
    await resetPasswordHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("400s when the reset link is invalid or expired", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: false });
    const { req, res } = createApiMocks({
      body: { token: "bad-token", password: "longenough1" },
    });
    await resetPasswordHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("succeeds with a valid token and password", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true });
    const { req, res } = createApiMocks({
      body: { token: "good-token", password: "longenough1" },
    });
    await resetPasswordHandler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });

  it("reports loggedIn: false (falling back to the Sign in link) when the token's email can't be decoded", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true }); // password/reset
    const { req, res } = createApiMocks({
      body: { token: "not-a-real-jwt", password: "longenough1" },
    });
    await resetPasswordHandler(req, res);

    expect(res._getJSONData()).toEqual({ ok: true, loggedIn: false });
    expect(global.fetch).toHaveBeenCalledTimes(1); // never attempted a login
  });

  function jwtLikeTokenFor(email: string) {
    const payload = Buffer.from(JSON.stringify({ email })).toString(
      "base64url"
    );
    return `header.${payload}.signature`;
  }

  it("logs the user in immediately when the token's email decodes successfully", async () => {
    mockFindUserByEmail.mockResolvedValueOnce({
      id: "user-1",
      status: "invited",
    });
    mockAdminRequest.mockResolvedValueOnce(undefined); // updateUser

    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true }) // password/reset
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { access_token: "a", refresh_token: "r", expires: 900000 },
        }),
      }); // auth/login

    const { req, res } = createApiMocks({
      body: { token: jwtLikeTokenFor("a@b.com"), password: "longenough1" },
    });
    await resetPasswordHandler(req, res);

    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "https://directus.test/auth/login",
      expect.objectContaining({
        body: JSON.stringify({
          email: "a@b.com",
          password: "longenough1",
          mode: "json",
        }),
      })
    );
    expect(res._getJSONData()).toEqual({ ok: true, loggedIn: true });
    expect(res.getHeader("Set-Cookie")).toBeDefined();
  });

  it("promotes an incomplete account's status to active as part of a successful reset", async () => {
    mockFindUserByEmail.mockResolvedValueOnce({
      id: "user-1",
      status: "invited",
    });
    mockAdminRequest.mockResolvedValueOnce(undefined); // updateUser
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true }) // password/reset
      .mockResolvedValueOnce({ ok: false }); // auth/login (doesn't matter here)

    const { req, res } = createApiMocks({
      body: { token: jwtLikeTokenFor("a@b.com"), password: "longenough1" },
    });
    await resetPasswordHandler(req, res);

    expect(updateUser).toHaveBeenCalledWith("user-1", { status: "active" });
  });

  it("doesn't bother re-writing status for an account that's already active", async () => {
    mockFindUserByEmail.mockResolvedValueOnce({
      id: "user-1",
      status: "active",
    });
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true }) // password/reset
      .mockResolvedValueOnce({ ok: false }); // auth/login

    const { req, res } = createApiMocks({
      body: { token: jwtLikeTokenFor("a@b.com"), password: "longenough1" },
    });
    await resetPasswordHandler(req, res);

    expect(mockAdminRequest).not.toHaveBeenCalled();
  });

  it("still reports success even if the status promotion itself fails", async () => {
    mockFindUserByEmail.mockRejectedValueOnce(new Error("directus down"));
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true }) // password/reset
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { access_token: "a", refresh_token: "r", expires: 900000 },
        }),
      }); // auth/login

    const { req, res } = createApiMocks({
      body: { token: jwtLikeTokenFor("a@b.com"), password: "longenough1" },
    });
    await resetPasswordHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ ok: true, loggedIn: true });
  });
});

describe("POST /api/auth/change-password", () => {
  it("400s when the password is too short", async () => {
    const { req, res } = createApiMocks({ body: { password: "short" } });
    await changePasswordHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(mockGetValidAccessToken).not.toHaveBeenCalled();
  });

  it("401s when the caller isn't authenticated", async () => {
    mockGetValidAccessToken.mockResolvedValueOnce(null);
    const { req, res } = createApiMocks({ body: { password: "longenough1" } });
    await changePasswordHandler(req, res);
    expect(res._getStatusCode()).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("400s when Directus rejects the update (e.g. missing permission)", async () => {
    mockGetValidAccessToken.mockResolvedValueOnce("valid-token");
    (global.fetch as Mock).mockResolvedValueOnce({ ok: false });
    const { req, res } = createApiMocks({ body: { password: "longenough1" } });
    await changePasswordHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("updates the password using the caller's own token", async () => {
    mockGetValidAccessToken.mockResolvedValueOnce("valid-token");
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true });
    const { req, res } = createApiMocks({ body: { password: "longenough1" } });
    await changePasswordHandler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      `${DIRECTUS_URL}/users/me`,
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          Authorization: "Bearer valid-token",
        }),
        body: JSON.stringify({ password: "longenough1" }),
      })
    );
    expect(res._getStatusCode()).toBe(200);
  });
});
