import { randomBytes } from "crypto";
import { createUser, readUsers, updateUser } from "@directus/sdk";
import Stripe from "stripe";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import { sendSlackMessage } from "@/lib/slack";

// Directus's /users/invite endpoint requires the role's id (a GUID). Read
// directly from the environment rather than looking it up by display name —
// a role rename in Directus (which has already happened once) would
// otherwise silently break signup. Differs between environments, same as
// DIRECTUS_ADMIN_TOKEN.
export async function getAppUserRoleId(): Promise<string> {
  const roleId = process.env.DIRECTUS_SUPPORTER_ROLE_ID;
  if (!roleId) {
    throw new Error("DIRECTUS_SUPPORTER_ROLE_ID is not set");
  }
  return roleId;
}

interface SubscriptionFields {
  stripe_customer_id: string;
  stripe_subscription_id: string;
  subscription_status: string;
  supporter_amount_cents: number | null;
  supporter_interval: "month" | "year" | null;
}

export function fieldsFromSubscription(
  subscription: Stripe.Subscription
): SubscriptionFields & { payment_failed_at?: null } {
  const item = subscription.items.data[0];
  const price = item?.price;

  return {
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    supporter_amount_cents: price?.unit_amount ?? null,
    supporter_interval:
      (price?.recurring?.interval as "month" | "year" | undefined) ?? null,
    // A sync landing here means Stripe reported a subscription state for
    // this customer, so any earlier payment-failure flag is stale.
    ...(subscription.status === "active" ? { payment_failed_at: null } : {}),
  };
}

export async function findUserByEmail(email: string) {
  const users = await directusMembershipAdmin.request(
    readUsers({
      filter: { email: { _eq: email } },
      limit: 1,
      // status distinguishes a real account (someone chose their own
      // password, status "active") from one that only has a random
      // placeholder (status "invited") — see complete-signup.ts and
      // upsertSupporterFromCheckout below. Setting "invited" directly here
      // (rather than via Directus's /users/invite endpoint) does not send
      // any email — confirmed directly against the live instance — and
      // Directus's own password-reset flow works fine against it too.
      fields: ["id", "email", "status"],
    })
  );
  return users[0] ?? null;
}

type MembershipUser = { id: string; email: string; status?: string };

/**
 * Finds a Directus user by email, or creates one with the given fields if
 * none exists. Shared by the two places that can independently race to
 * create the same account — complete-signup.ts (the customer actively
 * submitting the password form) and upsertSupporterFromCheckout below (the
 * webhook's silent fallback) — both may run for the same email within
 * moments of each other. If createUser fails, re-checks for a user that
 * appeared in the meantime before giving up; callers decide how to log/alert
 * on a genuine failure, since that context (a Stripe session id, an app
 * signup, etc.) differs per caller.
 */
export async function findOrCreateUser(
  email: string,
  createFields: Record<string, unknown>
): Promise<MembershipUser> {
  const existing = await findUserByEmail(email);
  if (existing) return existing as unknown as MembershipUser;

  try {
    const created = await directusMembershipAdmin.request(
      createUser({ email, ...createFields } as unknown as Record<
        string,
        unknown
      >)
    );
    return created as unknown as MembershipUser;
  } catch (error) {
    const concurrent = await findUserByEmail(email);
    if (concurrent) return concurrent as unknown as MembershipUser;
    throw error;
  }
}

async function findUserByStripeCustomerId(customerId: string) {
  const users = await directusMembershipAdmin.request(
    readUsers({
      filter: { stripe_customer_id: { _eq: customerId } },
      limit: 1,
      fields: ["id"],
    })
  );
  return users[0] ?? null;
}

/**
 * Called on checkout.session.completed. Finds the Directus user by email, or
 * creates one (no email — see note below) if they're new — then stores the
 * Stripe subscription details on their record.
 *
 * This is the fallback path for someone who pays but never returns to
 * /supporters/success to submit the password form there (which is what
 * normally creates the account, with the password they chose). It used to
 * invite them via Directus's own inviteUser(), but that sends Directus's
 * stock invite email — wrong template, and not something we want firing
 * automatically for every pay-first signup. Instead this creates the
 * account with an unusable random password and sends nothing; if they never
 * came back to set a real one, "Forgot password" on the sign-in page works
 * against this account exactly the same as any other.
 */
export async function upsertSupporterFromCheckout(
  email: string,
  subscription: Stripe.Subscription
) {
  const roleId = await getAppUserRoleId();
  const placeholderPassword = randomBytes(24).toString("hex");

  let user: MembershipUser;
  try {
    user = await findOrCreateUser(email, {
      password: placeholderPassword,
      role: roleId,
      status: "invited",
    });
  } catch (error) {
    sendSlackMessage(
      `[membership] a paid customer (${email}) could not get an account created — needs manual follow-up. ${error.message}`,
      "error"
    );
    throw error;
  }
  console.log(`[membership] resolved Directus user ${user.id} for ${email}`);

  const fields = fieldsFromSubscription(subscription);
  console.log(
    `[membership] writing subscription fields to user ${user.id}:`,
    fields
  );

  await directusMembershipAdmin.request(
    // The SDK's DirectusUser type doesn't know about our custom
    // supporter/subscription fields — they exist in the schema (see
    // refugeWorldwideApp/scripts/directus-schema) but not in the untyped
    // client's generic Schema=any.
    updateUser(user.id, fields as unknown as Record<string, unknown>)
  );
  console.log(`[membership] subscription fields written for user ${user.id}`);
}

/** Called on customer.subscription.updated/deleted to keep status in sync. */
export async function syncSupporterSubscription(
  subscription: Stripe.Subscription
) {
  const user = await findUserByStripeCustomerId(
    subscription.customer as string
  );
  if (!user) {
    console.warn(
      `[membership] no Directus user found for Stripe customer ${subscription.customer}`
    );
    return;
  }

  console.log(
    `[membership] syncing subscription status for user ${user.id}: ${subscription.status}`
  );

  await directusMembershipAdmin.request(
    // The SDK's DirectusUser type doesn't know about our custom
    // supporter/subscription fields — they exist in the schema (see
    // refugeWorldwideApp/scripts/directus-schema) but not in the untyped
    // client's generic Schema=any.
    updateUser(
      user.id,
      fieldsFromSubscription(subscription) as unknown as Record<string, unknown>
    )
  );
}

/**
 * Called on invoice.payment_failed. Stripe itself emails the customer about
 * the failed charge — this just flags it on their Directus record so it can
 * be surfaced in the account UI.
 */
export async function markPaymentFailed(customerId: string) {
  const user = await findUserByStripeCustomerId(customerId);
  if (!user) {
    console.warn(
      `[membership] no Directus user found for Stripe customer ${customerId} (payment_failed)`
    );
    return;
  }

  await directusMembershipAdmin.request(
    updateUser(user.id, {
      payment_failed_at: new Date().toISOString(),
    } as unknown as Record<string, unknown>)
  );
}
