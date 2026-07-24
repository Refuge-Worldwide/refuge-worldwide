import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createApiMocks } from "../helpers/createApiMocks";
import portalHandler from "@/pages/api/stripe/portal";
import createCheckoutSessionHandler from "@/pages/api/stripe/create-checkout-session";
import { getSessionUser } from "@/lib/directus/session";
import { stripe } from "@/lib/stripe/config";

vi.mock("@/lib/directus/session", async () => ({
  ...(await vi.importActual<typeof import("@/lib/directus/session")>(
    "@/lib/directus/session"
  )),
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/stripe/config", () => ({
  stripe: {
    billingPortal: { sessions: { create: vi.fn() } },
    checkout: { sessions: { create: vi.fn() } },
    prices: { list: vi.fn() },
  },
}));

const mockGetSessionUser = getSessionUser as Mock;
const mockPortalCreate = stripe.billingPortal.sessions.create as Mock;
const mockCheckoutCreate = stripe.checkout.sessions.create as Mock;
const mockPricesList = stripe.prices.list as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/stripe/portal", () => {
  it("rejects non-POST methods", async () => {
    const { req, res } = createApiMocks({ method: "GET" });
    await portalHandler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("401s when the caller isn't authenticated", async () => {
    mockGetSessionUser.mockResolvedValueOnce(null);
    const { req, res } = createApiMocks();
    await portalHandler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it("404s when the user has no Stripe customer id", async () => {
    mockGetSessionUser.mockResolvedValueOnce({
      id: "u1",
      stripe_customer_id: null,
    });
    const { req, res } = createApiMocks();
    await portalHandler(req, res);
    expect(res._getStatusCode()).toBe(404);
  });

  it("creates a portal session for a supporter and returns its url", async () => {
    mockGetSessionUser.mockResolvedValueOnce({
      id: "u1",
      stripe_customer_id: "cus_1",
    });
    mockPortalCreate.mockResolvedValueOnce({
      url: "https://billing.stripe.com/xyz",
    });

    const { req, res } = createApiMocks();
    await portalHandler(req, res);

    expect(mockPortalCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_1" })
    );
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      url: "https://billing.stripe.com/xyz",
    });
  });

  it("500s when Stripe errors creating the portal session", async () => {
    mockGetSessionUser.mockResolvedValueOnce({
      id: "u1",
      stripe_customer_id: "cus_1",
    });
    mockPortalCreate.mockRejectedValueOnce(new Error("stripe down"));

    const { req, res } = createApiMocks();
    await portalHandler(req, res);
    expect(res._getStatusCode()).toBe(500);
  });
});

describe("POST /api/stripe/create-checkout-session", () => {
  it("400s on an amount outside the fixed tier list", async () => {
    const { req, res } = createApiMocks({
      body: { amountEur: 999, interval: "month" },
    });
    await createCheckoutSessionHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("400s on an invalid interval", async () => {
    const { req, res } = createApiMocks({
      body: { amountEur: 5, interval: "week" },
    });
    await createCheckoutSessionHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("500s when no matching Stripe price exists for the tier", async () => {
    mockPricesList.mockResolvedValueOnce({ data: [] });
    const { req, res } = createApiMocks({
      body: { amountEur: 7.5, interval: "month" },
    });
    await createCheckoutSessionHandler(req, res);
    expect(res._getStatusCode()).toBe(500);
  });

  it("looks up the price by lookup_key and creates an embedded checkout session", async () => {
    mockPricesList.mockResolvedValueOnce({ data: [{ id: "price_123" }] });
    mockCheckoutCreate.mockResolvedValueOnce({ client_secret: "secret_abc" });

    const { req, res } = createApiMocks({
      body: { amountEur: 7.5, interval: "month" },
    });
    await createCheckoutSessionHandler(req, res);

    expect(mockPricesList).toHaveBeenCalledWith(
      expect.objectContaining({ lookup_keys: ["supporter_7_5_month"] })
    );
    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        line_items: [{ price: "price_123", quantity: 1 }],
      })
    );
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ clientSecret: "secret_abc" });
  });

  it("500s when Stripe fails to create the checkout session", async () => {
    mockPricesList.mockResolvedValueOnce({ data: [{ id: "price_123" }] });
    mockCheckoutCreate.mockRejectedValueOnce(new Error("stripe down"));

    const { req, res } = createApiMocks({
      body: { amountEur: 5, interval: "year" },
    });
    await createCheckoutSessionHandler(req, res);
    expect(res._getStatusCode()).toBe(500);
  });
});
