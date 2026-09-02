import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createUser } from "@directus/sdk";
import { createApiMocks } from "../helpers/createApiMocks";
import signupHandler from "@/pages/api/auth/signup";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import { findUserByEmail, getAppUserRoleId } from "@/lib/membership";
import { sendWelcomeCompletePaymentEmail } from "@/lib/resend/email";
import { getClientIp } from "@/lib/signupRateLimit";

vi.mock("@/lib/directus/admin", () => ({
  directusMembershipAdmin: { request: vi.fn() },
}));

vi.mock("@directus/sdk", () => ({
  createUser: vi.fn((data) => ({ __op: "createUser", data })),
}));

vi.mock("@/lib/membership", () => ({
  findUserByEmail: vi.fn(),
  getAppUserRoleId: vi.fn(),
}));

vi.mock("@/lib/resend/email", () => ({
  sendWelcomeCompletePaymentEmail: vi.fn(),
}));

vi.mock("@/lib/signupRateLimit", () => ({
  getClientIp: vi.fn(),
}));

const mockRequest = directusMembershipAdmin.request as Mock;
const mockFindUserByEmail = findUserByEmail as Mock;
const mockGetAppUserRoleId = getAppUserRoleId as Mock;
const mockSendEmail = sendWelcomeCompletePaymentEmail as Mock;
const mockGetClientIp = getClientIp as Mock;

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAppUserRoleId.mockResolvedValue("role-1");
  mockSendEmail.mockResolvedValue(undefined);
  mockGetClientIp.mockReturnValue("1.2.3.4");
});

describe("POST /api/auth/signup", () => {
  it("answers CORS preflight requests", async () => {
    const { req, res } = createApiMocks({ method: "OPTIONS" });
    await signupHandler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res.getHeader("Access-Control-Allow-Origin")).toBe("*");
  });

  it("rejects non-POST, non-OPTIONS methods", async () => {
    const { req, res } = createApiMocks({ method: "GET" });
    await signupHandler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("400s when email, password or username is missing", async () => {
    const { req, res } = createApiMocks({
      body: { email: "a@b.com", password: "longenough1" },
    });
    await signupHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("400s when the password is too short", async () => {
    const { req, res } = createApiMocks({
      body: { email: "a@b.com", password: "short", username: "dj" },
    });
    await signupHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("500s if the existence check itself fails", async () => {
    mockFindUserByEmail.mockRejectedValueOnce(new Error("directus down"));
    const { req, res } = createApiMocks({
      body: { email: "a@b.com", password: "longenough1", username: "dj" },
    });
    await signupHandler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("409s when an account already exists for that email", async () => {
    mockFindUserByEmail.mockResolvedValueOnce({ id: "user-1" });
    const { req, res } = createApiMocks({
      body: { email: "a@b.com", password: "longenough1", username: "dj" },
    });
    await signupHandler(req, res);
    expect(res._getStatusCode()).toBe(409);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("creates the account, sends the welcome email, and never returns tokens", async () => {
    mockFindUserByEmail.mockResolvedValueOnce(null);
    mockRequest.mockResolvedValueOnce({ id: "user-new" });

    const { req, res } = createApiMocks({
      body: {
        email: "new@b.com",
        password: "longenough1",
        username: "  DJ Refuge  ",
      },
    });
    await signupHandler(req, res);

    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@b.com",
        password: "longenough1",
        first_name: "DJ Refuge",
        role: "role-1",
        signup_ip: "1.2.3.4",
        status: "active",
      })
    );
    expect(mockSendEmail).toHaveBeenCalledWith("new@b.com", "DJ Refuge");
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ ok: true });
  });

  it("500s if Directus fails to create the user", async () => {
    mockFindUserByEmail.mockResolvedValueOnce(null);
    mockRequest.mockRejectedValueOnce(new Error("directus down"));

    const { req, res } = createApiMocks({
      body: { email: "new@b.com", password: "longenough1", username: "dj" },
    });
    await signupHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});
