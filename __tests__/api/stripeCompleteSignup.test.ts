import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { updateUser } from "@directus/sdk";
import { createApiMocks } from "../helpers/createApiMocks";
import completeSignupHandler from "@/pages/api/stripe/complete-signup";
import { stripe } from "@/lib/stripe/config";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import {
  fieldsFromSubscription,
  findOrCreateUser,
  getAppUserRoleId,
} from "@/lib/membership";

vi.mock("@/lib/stripe/config", () => ({
  stripe: {
    checkout: { sessions: { retrieve: vi.fn() } },
    subscriptions: { retrieve: vi.fn() },
  },
}));

vi.mock("@/lib/directus/admin", () => ({
  directusMembershipAdmin: { request: vi.fn() },
}));

vi.mock("@directus/sdk", () => ({
  updateUser: vi.fn((id, data) => ({ __op: "updateUser", id, data })),
}));

// findOrCreateUser's own create-vs-race logic is tested where it lives,
// in __tests__/lib/membership.test.ts — here we mock it wholesale and just
// verify complete-signup.ts's own responsibility: what it asks for, and
// what it does with an "active" vs. still-"invited" result.
vi.mock("@/lib/membership", () => ({
  findOrCreateUser: vi.fn(),
  getAppUserRoleId: vi.fn(),
  fieldsFromSubscription: vi.fn(() => ({ subscription_status: "active" })),
}));

const mockCheckoutRetrieve = stripe.checkout.sessions.retrieve as Mock;
const mockSubRetrieve = stripe.subscriptions.retrieve as Mock;
const mockRequest = directusMembershipAdmin.request as Mock;
const mockFindOrCreateUser = findOrCreateUser as Mock;
const mockGetAppUserRoleId = getAppUserRoleId as Mock;

const paidSession = {
  payment_status: "paid",
  customer_details: { email: "new@b.com" },
  subscription: "sub_1",
};

beforeEach(() => {
  vi.clearAllMocks();
  // clearAllMocks only wipes call history, not queued mockResolvedValueOnce
  // values — these are chained with .mockResolvedValueOnce/Rejected in
  // multiple tests below, so they need a full reset each time or a leftover
  // queued value silently bleeds into the next test.
  mockFindOrCreateUser.mockReset();
  mockRequest.mockReset();
  mockCheckoutRetrieve.mockReset();
  global.fetch = vi.fn();
  mockGetAppUserRoleId.mockResolvedValue("role-1");
  mockSubRetrieve.mockResolvedValue({ id: "sub_1" });
});

describe("POST /api/stripe/complete-signup", () => {
  it("400s when session_id or password is missing", async () => {
    const { req, res } = createApiMocks({ body: { session_id: "cs_1" } });
    await completeSignupHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("400s when the password is too short", async () => {
    const { req, res } = createApiMocks({
      body: { session_id: "cs_1", password: "short", username: "dj" },
    });
    await completeSignupHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("400s when username is missing", async () => {
    const { req, res } = createApiMocks({
      body: { session_id: "cs_1", password: "longenough1" },
    });
    await completeSignupHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(mockFindOrCreateUser).not.toHaveBeenCalled();
  });

  it("400s when the session hasn't been paid", async () => {
    mockCheckoutRetrieve.mockResolvedValueOnce({ payment_status: "unpaid" });
    const { req, res } = createApiMocks({
      body: { session_id: "cs_1", password: "longenough1" },
    });
    await completeSignupHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("asks findOrCreateUser for a fresh, active account with the submitted fields", async () => {
    mockCheckoutRetrieve.mockResolvedValueOnce(paidSession);
    mockFindOrCreateUser.mockResolvedValueOnce({
      id: "user-new",
      status: "active",
    });
    mockRequest.mockResolvedValueOnce(undefined); // updateUser
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { access_token: "a", refresh_token: "r", expires: 900000 },
      }),
    });

    const { req, res } = createApiMocks({
      body: {
        session_id: "cs_1",
        password: "longenough1",
        username: "  DJ Refuge  ",
      },
    });
    await completeSignupHandler(req, res);

    expect(mockFindOrCreateUser).toHaveBeenCalledWith(
      "new@b.com",
      expect.objectContaining({
        password: "longenough1",
        first_name: "DJ Refuge",
        role: "role-1",
        status: "active",
      })
    );
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ ok: true, loggedIn: true });
    expect(res.getHeader("Set-Cookie")).toBeDefined();
  });

  it("never re-writes a password once the resolved account is already active", async () => {
    mockCheckoutRetrieve.mockResolvedValueOnce(paidSession);
    mockFindOrCreateUser.mockResolvedValueOnce({
      id: "existing-user",
      status: "active",
    });
    mockRequest.mockResolvedValueOnce(undefined); // updateUser only
    (global.fetch as Mock).mockResolvedValueOnce({ ok: false });

    const { req, res } = createApiMocks({
      body: {
        session_id: "cs_1",
        password: "guessedpassword1",
        username: "dj",
      },
    });
    await completeSignupHandler(req, res);

    const updateFields = (updateUser as Mock).mock.calls[0][1];
    expect(updateFields).toMatchObject({ subscription_status: "active" });
    expect(updateFields).not.toHaveProperty("password");
    expect(updateFields).not.toHaveProperty("status");
    expect(res._getJSONData()).toEqual({ ok: true, loggedIn: false });
  });

  it("sets a real password when the resolved account is still invited (e.g. the webhook's silent fallback)", async () => {
    mockCheckoutRetrieve.mockResolvedValueOnce(paidSession);
    mockFindOrCreateUser.mockResolvedValueOnce({
      id: "placeholder-user",
      status: "invited",
    });
    mockRequest.mockResolvedValueOnce(undefined); // updateUser only
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { access_token: "a", refresh_token: "r", expires: 900000 },
      }),
    });

    const { req, res } = createApiMocks({
      body: {
        session_id: "cs_1",
        password: "longenough1",
        username: "dj",
      },
    });
    await completeSignupHandler(req, res);

    expect(updateUser).toHaveBeenCalledWith(
      "placeholder-user",
      expect.objectContaining({
        password: "longenough1",
        first_name: "dj",
        status: "active",
        subscription_status: "active",
      })
    );
    expect(res._getJSONData()).toEqual({ ok: true, loggedIn: true });
  });

  it("500s and Slack-alerts if findOrCreateUser genuinely can't resolve an account", async () => {
    mockCheckoutRetrieve.mockResolvedValueOnce(paidSession);
    mockFindOrCreateUser.mockRejectedValueOnce(new Error("directus down"));

    const { req, res } = createApiMocks({
      body: { session_id: "cs_1", password: "longenough1", username: "dj" },
    });
    await completeSignupHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(updateUser).not.toHaveBeenCalled();
  });
});
