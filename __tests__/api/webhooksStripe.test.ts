import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createApiMocks } from "../helpers/createApiMocks";
import { stripe } from "@/lib/stripe/config";
import {
  markPaymentFailed,
  syncSupporterSubscription,
  upsertSupporterFromCheckout,
} from "@/lib/membership";
import handler from "@/pages/api/webhooks/stripe";

vi.mock("@/lib/stripe/config", () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
    subscriptions: { retrieve: vi.fn() },
  },
}));

vi.mock("@/lib/membership", () => ({
  upsertSupporterFromCheckout: vi.fn(),
  syncSupporterSubscription: vi.fn(),
  markPaymentFailed: vi.fn(),
}));

const mockConstructEvent = stripe.webhooks.constructEvent as Mock;
const mockRetrieveSubscription = stripe.subscriptions.retrieve as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

function sendWebhook(event: unknown) {
  mockConstructEvent.mockReturnValue(event);
  const { req, res } = createApiMocks({
    method: "POST",
    // Body content is irrelevant — constructEvent is mocked to return
    // `event` regardless of what raw bytes it's given.
  });
  req.headers["stripe-signature"] = "test-signature";
  const promise = handler(req, res);
  req.send("raw-body");
  return { req, res, promise };
}

describe("webhook signature/setup checks", () => {
  it("400s when the stripe-signature header is missing", async () => {
    const { req, res } = createApiMocks({ method: "POST" });
    const promise = handler(req, res);
    req.send("raw-body");
    await promise;

    expect(res._getStatusCode()).toBe(400);
    expect(mockConstructEvent).not.toHaveBeenCalled();
  });

  it("400s when signature verification throws", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("invalid signature");
    });
    const { req, res } = createApiMocks({ method: "POST" });
    req.headers["stripe-signature"] = "bad-signature";
    const promise = handler(req, res);
    req.send("raw-body");
    await promise;

    expect(res._getStatusCode()).toBe(400);
  });

  it("rejects non-POST methods", async () => {
    const { req, res } = createApiMocks({ method: "GET" });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("acknowledges but ignores event types outside relevantEvents", async () => {
    const { res, promise } = sendWebhook({
      type: "customer.created",
      id: "evt_1",
    });
    await promise;

    expect(res._getStatusCode()).toBe(200);
    expect(upsertSupporterFromCheckout).not.toHaveBeenCalled();
    expect(syncSupporterSubscription).not.toHaveBeenCalled();
    expect(markPaymentFailed).not.toHaveBeenCalled();
  });
});

describe("checkout.session.completed", () => {
  it("retrieves the subscription and upserts the supporter", async () => {
    mockRetrieveSubscription.mockResolvedValue({
      id: "sub_1",
      status: "active",
    });
    const { res, promise } = sendWebhook({
      type: "checkout.session.completed",
      id: "evt_1",
      data: {
        object: {
          customer_details: { email: "a@b.com" },
          subscription: "sub_1",
        },
      },
    });
    await promise;

    expect(mockRetrieveSubscription).toHaveBeenCalledWith("sub_1");
    expect(upsertSupporterFromCheckout).toHaveBeenCalledWith("a@b.com", {
      id: "sub_1",
      status: "active",
    });
    expect(res._getStatusCode()).toBe(200);
  });

  it("skips processing when email or subscription id is missing", async () => {
    const { res, promise } = sendWebhook({
      type: "checkout.session.completed",
      id: "evt_1",
      data: { object: { customer_details: {}, subscription: null } },
    });
    await promise;

    expect(upsertSupporterFromCheckout).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });

  it("400s when the handler throws", async () => {
    mockRetrieveSubscription.mockResolvedValue({ id: "sub_1" });
    (upsertSupporterFromCheckout as Mock).mockRejectedValue(
      new Error("directus down")
    );
    const { res, promise } = sendWebhook({
      type: "checkout.session.completed",
      id: "evt_1",
      data: {
        object: {
          customer_details: { email: "a@b.com" },
          subscription: "sub_1",
        },
      },
    });
    await promise;

    expect(res._getStatusCode()).toBe(400);
  });
});

describe("customer.subscription.updated / .deleted", () => {
  it("syncs the subscription status", async () => {
    const subscription = { id: "sub_1", customer: "cus_1", status: "past_due" };
    const { res, promise } = sendWebhook({
      type: "customer.subscription.updated",
      id: "evt_1",
      data: { object: subscription },
    });
    await promise;

    expect(syncSupporterSubscription).toHaveBeenCalledWith(subscription);
    expect(res._getStatusCode()).toBe(200);
  });

  it("syncs on deletion too", async () => {
    const subscription = { id: "sub_1", customer: "cus_1", status: "canceled" };
    const { res, promise } = sendWebhook({
      type: "customer.subscription.deleted",
      id: "evt_1",
      data: { object: subscription },
    });
    await promise;

    expect(syncSupporterSubscription).toHaveBeenCalledWith(subscription);
    expect(res._getStatusCode()).toBe(200);
  });
});

describe("invoice.payment_failed", () => {
  it("flags the customer's account", async () => {
    const { res, promise } = sendWebhook({
      type: "invoice.payment_failed",
      id: "evt_1",
      data: { object: { customer: "cus_1" } },
    });
    await promise;

    expect(markPaymentFailed).toHaveBeenCalledWith("cus_1");
    expect(res._getStatusCode()).toBe(200);
  });
});
