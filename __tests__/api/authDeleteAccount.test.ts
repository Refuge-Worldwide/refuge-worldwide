import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createApiMocks } from "../helpers/createApiMocks";
import handler from "@/pages/api/auth/delete-account";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import { stripe } from "@/lib/stripe/config";
import { getValidAccessToken } from "@/lib/directus/session";
import { unsubscribeDeletedUser } from "@/lib/mailchimp";

vi.mock("@/lib/directus/admin", () => ({
  directusMembershipAdmin: { request: vi.fn() },
}));
vi.mock("@directus/sdk", () => ({
  deleteUser: vi.fn((id) => ({ __op: "deleteUser", id })),
}));
vi.mock("@/lib/stripe/config", () => ({
  stripe: { subscriptions: { cancel: vi.fn() } },
}));
vi.mock("@/lib/directus/session", () => ({
  directusUrl: "https://directus.test",
  getValidAccessToken: vi.fn(),
  clearSessionCookies: vi.fn(),
}));
vi.mock("@/lib/slack", () => ({ sendSlackMessage: vi.fn() }));
vi.mock("@/lib/mailchimp", () => ({ unsubscribeDeletedUser: vi.fn() }));

const mockAdmin = directusMembershipAdmin.request as Mock;
const mockCancel = stripe.subscriptions.cancel as Mock;
const mockToken = getValidAccessToken as Mock;
const mockFetch = vi.fn();

function meResponse(data: object, ok = true) {
  return { ok, json: async () => ({ data }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
});

describe("POST /api/auth/delete-account", () => {
  it("401s without a session", async () => {
    mockToken.mockResolvedValueOnce(null);
    const { req, res } = createApiMocks();
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
    expect(mockAdmin).not.toHaveBeenCalled();
  });

  it("cancels the subscription then deletes the account (cookie session)", async () => {
    mockToken.mockResolvedValueOnce("cookie-token");
    mockFetch.mockResolvedValueOnce(
      meResponse({
        id: "u1",
        email: "a@b.com",
        stripe_subscription_id: "sub_1",
      })
    );
    mockCancel.mockResolvedValueOnce({});
    mockAdmin.mockResolvedValueOnce({});

    const { req, res } = createApiMocks();
    await handler(req, res);

    expect(mockCancel).toHaveBeenCalledWith("sub_1");
    expect(mockAdmin).toHaveBeenCalledWith({ __op: "deleteUser", id: "u1" });
    expect(unsubscribeDeletedUser).toHaveBeenCalledWith("a@b.com");
    expect(res._getStatusCode()).toBe(200);
  });

  it("accepts a Bearer token from the app", async () => {
    mockFetch.mockResolvedValueOnce(meResponse({ id: "u1", email: "a@b.com" }));
    mockAdmin.mockResolvedValueOnce({});

    const { req, res } = createApiMocks();
    req.headers.authorization = "Bearer app-token";
    await handler(req, res);

    expect(mockToken).not.toHaveBeenCalled();
    expect(mockCancel).not.toHaveBeenCalled();
    expect(mockAdmin).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });

  it("leaves the account alone if the subscription can't be cancelled", async () => {
    mockToken.mockResolvedValueOnce("t");
    mockFetch.mockResolvedValueOnce(
      meResponse({
        id: "u1",
        email: "a@b.com",
        stripe_subscription_id: "sub_1",
      })
    );
    mockCancel.mockRejectedValueOnce(
      Object.assign(new Error("boom"), { code: "api_error" })
    );

    const { req, res } = createApiMocks();
    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(mockAdmin).not.toHaveBeenCalled();
    expect(unsubscribeDeletedUser).not.toHaveBeenCalled();
  });

  it("still deletes when Stripe no longer has the subscription", async () => {
    mockToken.mockResolvedValueOnce("t");
    mockFetch.mockResolvedValueOnce(
      meResponse({
        id: "u1",
        email: "a@b.com",
        stripe_subscription_id: "sub_1",
      })
    );
    mockCancel.mockRejectedValueOnce(
      Object.assign(new Error("gone"), { code: "resource_missing" })
    );
    mockAdmin.mockResolvedValueOnce({});

    const { req, res } = createApiMocks();
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });
});
