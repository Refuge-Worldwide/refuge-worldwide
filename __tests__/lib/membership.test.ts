import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { readRoles, readUsers, updateUser, inviteUser } from "@directus/sdk";
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

vi.mock("@directus/sdk", () => ({
  readRoles: vi.fn((query) => ({ __op: "readRoles", query })),
  readUsers: vi.fn((query) => ({ __op: "readUsers", query })),
  updateUser: vi.fn((id, data) => ({ __op: "updateUser", id, data })),
  inviteUser: vi.fn((email, role, inviteUrl) => ({
    __op: "inviteUser",
    email,
    role,
    inviteUrl,
  })),
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

    expect(inviteUser).not.toHaveBeenCalled();
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

  // getAppUserRoleId() caches the role id at module scope for the server's
  // lifetime, so a positional mockResolvedValueOnce chain would only line up
  // the first time this path runs in the suite — routing by operation type
  // instead makes these tests indifferent to whether the cache is warm.
  function routeByOp(responses: {
    findUserByEmail: unknown[];
    readRoles?: { id: string }[];
    inviteUser?: unknown;
    updateUser?: unknown;
  }) {
    let findUserByEmailCall = 0;
    mockRequest.mockImplementation(async (op: any) => {
      if (op.__op === "readUsers" && "email" in (op.query.filter ?? {})) {
        return responses.findUserByEmail[findUserByEmailCall++];
      }
      if (op.__op === "readRoles")
        return responses.readRoles ?? [{ id: "role-1" }];
      if (op.__op === "inviteUser") return responses.inviteUser;
      if (op.__op === "updateUser") return responses.updateUser;
      throw new Error(`Unexpected op in test: ${op.__op}`);
    });
  }

  it("invites a new user by email, then writes subscription fields", async () => {
    routeByOp({
      findUserByEmail: [[], [{ id: "user-new", email: "new@b.com" }]],
    });

    await upsertSupporterFromCheckout("new@b.com", subscription());

    expect(inviteUser).toHaveBeenCalledWith(
      "new@b.com",
      "role-1",
      expect.stringContaining("/account/accept-invite")
    );
    expect(updateUser).toHaveBeenCalledWith(
      "user-new",
      expect.objectContaining({ stripe_customer_id: "cus_1" })
    );
  });

  it("throws if the invited user still can't be found afterwards", async () => {
    routeByOp({ findUserByEmail: [[], []] });

    await expect(
      upsertSupporterFromCheckout("ghost@b.com", subscription())
    ).rejects.toThrow(/could not find the resulting Directus user/);
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
