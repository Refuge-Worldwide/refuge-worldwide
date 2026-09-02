import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { readUsers, updateUser, createUser } from "@directus/sdk";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import {
  markPaymentFailed,
  syncSupporterSubscription,
  upsertSupporterFromCheckout,
} from "@/lib/membership";
import type Stripe from "stripe";

vi.mock("@/lib/directus/admin", () => ({
  directusMembershipAdmin: { request: vi.fn() },
}));

vi.mock("@/lib/slack", () => ({
  sendSlackMessage: vi.fn(),
}));

vi.mock("@directus/sdk", () => ({
  readUsers: vi.fn((query) => ({ __op: "readUsers", query })),
  updateUser: vi.fn((id, data) => ({ __op: "updateUser", id, data })),
  createUser: vi.fn((data) => ({ __op: "createUser", data })),
}));

const mockRequest = directusMembershipAdmin.request as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

function subscription(overrides: Partial<Stripe.Subscription> = {}) {
  return {
    id: "sub_1",
    customer: "cus_1",
    status: "active",
    items: {
      data: [
        {
          price: {
            unit_amount: 750,
            recurring: { interval: "month" },
          },
        },
      ],
    },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

// ─── upsertSupporterFromCheckout ────────────────────────────────────────────

describe("upsertSupporterFromCheckout", () => {
  it("writes subscription fields to an existing user without inviting", async () => {
    mockRequest
      .mockResolvedValueOnce([{ id: "user-1", email: "a@b.com" }]) // findUserByEmail
      .mockResolvedValueOnce(undefined); // updateUser

    await upsertSupporterFromCheckout("a@b.com", subscription());

    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        stripe_customer_id: "cus_1",
        stripe_subscription_id: "sub_1",
        subscription_status: "active",
        supporter_amount_cents: 750,
        supporter_interval: "month",
        payment_failed_at: null,
      })
    );
  });

  // getAppUserRoleId() now just reads DIRECTUS_SUPPORTER_ROLE_ID (set to
  // "role-1" in vitest.setup.ts) rather than calling Directus — routing the
  // remaining ops by type keeps these tests order-independent regardless.
  function routeByOp(responses: {
    findUserByEmail: unknown[];
    createUser?: unknown;
    createUserError?: Error;
    updateUser?: unknown;
  }) {
    let findUserByEmailCall = 0;
    mockRequest.mockImplementation(async (op: any) => {
      if (op.__op === "readUsers" && "email" in (op.query.filter ?? {})) {
        return responses.findUserByEmail[findUserByEmailCall++];
      }
      if (op.__op === "createUser") {
        if (responses.createUserError) throw responses.createUserError;
        return responses.createUser;
      }
      if (op.__op === "updateUser") return responses.updateUser;
      throw new Error(`Unexpected op in test: ${op.__op}`);
    });
  }

  it("creates a new user silently (no email) when none exists, then writes subscription fields", async () => {
    routeByOp({
      findUserByEmail: [[]],
      createUser: { id: "user-new", email: "new@b.com" },
    });

    await upsertSupporterFromCheckout("new@b.com", subscription());

    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@b.com",
        role: "role-1",
        status: "invited",
      })
    );
    expect(updateUser).toHaveBeenCalledWith(
      "user-new",
      expect.objectContaining({ stripe_customer_id: "cus_1" })
    );
  });

  it("falls back to a concurrently-created account if createUser races (e.g. complete-signup.ts)", async () => {
    routeByOp({
      findUserByEmail: [[], [{ id: "user-from-success-page" }]],
      createUserError: new Error("duplicate email"),
    });

    await upsertSupporterFromCheckout("racey@b.com", subscription());

    expect(updateUser).toHaveBeenCalledWith(
      "user-from-success-page",
      expect.anything()
    );
  });

  it("rethrows if createUser fails and no concurrent account exists either", async () => {
    routeByOp({
      findUserByEmail: [[], []],
      createUserError: new Error("directus down"),
    });

    await expect(
      upsertSupporterFromCheckout("ghost@b.com", subscription())
    ).rejects.toThrow(/directus down/);
  });

  it("does not clear payment_failed_at for a non-active status", async () => {
    routeByOp({
      findUserByEmail: [[{ id: "user-1" }]],
      updateUser: undefined,
    });

    await upsertSupporterFromCheckout(
      "a@b.com",
      subscription({ status: "incomplete" })
    );

    const fields = (updateUser as Mock).mock.calls[0][1];
    expect(fields).not.toHaveProperty("payment_failed_at");
  });
});

// ─── syncSupporterSubscription ──────────────────────────────────────────────

describe("syncSupporterSubscription", () => {
  it("updates the matching user's subscription fields", async () => {
    mockRequest
      .mockResolvedValueOnce([{ id: "user-1" }]) // findUserByStripeCustomerId
      .mockResolvedValueOnce(undefined); // updateUser

    await syncSupporterSubscription(subscription({ status: "past_due" }));

    expect(updateUser).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ subscription_status: "past_due" })
    );
  });

  it("clears payment_failed_at when the subscription is active again", async () => {
    mockRequest
      .mockResolvedValueOnce([{ id: "user-1" }])
      .mockResolvedValueOnce(undefined);

    await syncSupporterSubscription(subscription({ status: "active" }));

    expect(updateUser).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ payment_failed_at: null })
    );
  });

  it("does nothing when no Directus user matches the Stripe customer", async () => {
    mockRequest.mockResolvedValueOnce([]); // findUserByStripeCustomerId: none

    await syncSupporterSubscription(subscription());

    expect(updateUser).not.toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });
});

// ─── markPaymentFailed ───────────────────────────────────────────────────────

describe("markPaymentFailed", () => {
  it("sets payment_failed_at on the matching user", async () => {
    mockRequest
      .mockResolvedValueOnce([{ id: "user-1" }]) // findUserByStripeCustomerId
      .mockResolvedValueOnce(undefined); // updateUser

    await markPaymentFailed("cus_1");

    expect(updateUser).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ payment_failed_at: expect.any(String) })
    );
  });

  it("does nothing when no Directus user matches the Stripe customer", async () => {
    mockRequest.mockResolvedValueOnce([]); // findUserByStripeCustomerId: none

    await markPaymentFailed("cus_unknown");

    expect(updateUser).not.toHaveBeenCalled();
  });
});
