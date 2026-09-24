import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createApiMocks } from "../helpers/createApiMocks";
import updateProfileHandler from "@/pages/api/auth/update-profile";
import acceptInviteHandler from "@/pages/api/auth/accept-invite";
import { getValidAccessToken } from "@/lib/directus/session";
import { readUsers, updateUser } from "@directus/sdk";
import { directusMembershipAdmin } from "@/lib/directus/admin";

vi.mock("@/lib/directus/session", async () => ({
  ...(await vi.importActual<typeof import("@/lib/directus/session")>(
    "@/lib/directus/session"
  )),
  getValidAccessToken: vi.fn(),
}));

vi.mock("@/lib/directus/admin", () => ({
  directusMembershipAdmin: { request: vi.fn() },
}));

vi.mock("@directus/sdk", () => ({
  readUsers: vi.fn((query) => ({ __op: "readUsers", query })),
  updateUser: vi.fn((id, data) => ({ __op: "updateUser", id, data })),
}));

const mockGetValidAccessToken = getValidAccessToken as Mock;
const mockAdminRequest = directusMembershipAdmin.request as Mock;
const DIRECTUS_URL = "https://directus.test";

beforeEach(() => {
  global.fetch = vi.fn();
  vi.clearAllMocks();
});

describe("POST /api/auth/update-profile", () => {
  it("400s when the username is too short", async () => {
    const { req, res } = createApiMocks({ body: { username: "a" } });
    await updateProfileHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(mockGetValidAccessToken).not.toHaveBeenCalled();
  });

  it("401s when the caller isn't authenticated", async () => {
    mockGetValidAccessToken.mockResolvedValueOnce(null);
    const { req, res } = createApiMocks({ body: { username: "newname" } });
    await updateProfileHandler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it("400s when Directus rejects the update (e.g. missing permission on first_name)", async () => {
    mockGetValidAccessToken.mockResolvedValueOnce("valid-token");
    (global.fetch as Mock).mockResolvedValueOnce({ ok: false });
    const { req, res } = createApiMocks({ body: { username: "newname" } });
    await updateProfileHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("updates first_name using the caller's own token", async () => {
    mockGetValidAccessToken.mockResolvedValueOnce("valid-token");
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true });
    const { req, res } = createApiMocks({ body: { username: "  newname  " } });
    await updateProfileHandler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      `${DIRECTUS_URL}/users/me`,
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          Authorization: "Bearer valid-token",
        }),
        body: JSON.stringify({ first_name: "newname" }),
      })
    );
    expect(res._getStatusCode()).toBe(200);
  });
});

describe("POST /api/auth/accept-invite", () => {
  // A real Directus invite JWT, minus signature — payload only needs to
  // decode via base64url, the handler never verifies it itself.
  function inviteToken(email: string) {
    const payload = Buffer.from(JSON.stringify({ email })).toString(
      "base64url"
    );
    return `header.${payload}.signature`;
  }

  it("400s when required fields are missing", async () => {
    const { req, res } = createApiMocks({ body: { token: "t" } });
    await acceptInviteHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("400s when the password is too short", async () => {
    const { req, res } = createApiMocks({
      body: { token: "t", password: "short", username: "name" },
    });
    await acceptInviteHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("400s when the invite link is invalid or expired", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: false });
    const { req, res } = createApiMocks({
      body: { token: "bad", password: "longenough1", username: "name" },
    });
    await acceptInviteHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("accepts the invite and sets the username from the decoded email", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true });
    mockAdminRequest
      .mockResolvedValueOnce([{ id: "user-1" }]) // readUsers by email
      .mockResolvedValueOnce(undefined); // updateUser

    const { req, res } = createApiMocks({
      body: {
        token: inviteToken("invited@b.com"),
        password: "longenough1",
        username: "  My Name  ",
      },
    });
    await acceptInviteHandler(req, res);

    expect(readUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { email: { _eq: "invited@b.com" } },
      })
    );
    expect(updateUser).toHaveBeenCalledWith("user-1", {
      first_name: "My Name",
    });
    expect(res._getStatusCode()).toBe(200);
  });

  it("still succeeds if the email can't be decoded from the token (username just isn't set)", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true });
    const { req, res } = createApiMocks({
      body: {
        token: "not-a-valid-jwt",
        password: "longenough1",
        username: "name",
      },
    });
    await acceptInviteHandler(req, res);

    expect(mockAdminRequest).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });

  it("still succeeds if no Directus user is found for the decoded email", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true });
    mockAdminRequest.mockResolvedValueOnce([]); // readUsers: none found

    const { req, res } = createApiMocks({
      body: {
        token: inviteToken("ghost@b.com"),
        password: "longenough1",
        username: "name",
      },
    });
    await acceptInviteHandler(req, res);

    expect(updateUser).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });
});
