import { inviteUser, readRoles, readUsers, updateUser } from "@directus/sdk";
import Stripe from "stripe";
import { directusMembershipAdmin } from "@/lib/directus/admin";

const APP_USER_ROLE_NAME = "Refuge App User";

// Directus's /users/invite endpoint requires the role's id (a GUID), not its
// display name — resolved once per server lifetime rather than hardcoding a
// UUID that could differ between environments.
let cachedAppUserRoleId: string | null = null;

async function getAppUserRoleId(): Promise<string> {
  if (cachedAppUserRoleId) return cachedAppUserRoleId;

  const roles = await directusMembershipAdmin.request(
    readRoles({
      filter: { name: { _eq: APP_USER_ROLE_NAME } },
      limit: 1,
      fields: ["id"],
    })
  );
  const role = roles[0];
  if (!role) {
    throw new Error(
      `Could not find a Directus role named "${APP_USER_ROLE_NAME}"`
    );
  }

  cachedAppUserRoleId = role.id;
  return role.id;
}

interface SubscriptionFields {
  stripe_customer_id: string;
  stripe_subscription_id: string;
  subscription_status: string;
  supporter_amount_cents: number | null;
  supporter_interval: "month" | "year" | null;
}

function fieldsFromSubscription(
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

async function findUserByEmail(email: string) {
  const users = await directusMembershipAdmin.request(
    readUsers({
      filter: { email: { _eq: email } },
      limit: 1,
      fields: ["id", "email"],
    })
  );
  return users[0] ?? null;
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
 * creates one via an emailed invite if they're new — then stores the Stripe
 * subscription details on their record.
 */
export async function upsertSupporterFromCheckout(
  email: string,
  subscription: Stripe.Subscription
) {
  let user = await findUserByEmail(email);

  if (!user) {
    console.log(
      `[membership] no existing Directus user for ${email}, inviting...`
    );
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/account/accept-invite`;
    const roleId = await getAppUserRoleId();
    await directusMembershipAdmin.request(inviteUser(email, roleId, inviteUrl));
    console.log(
      `[membership] invite sent to ${email} (invite_url=${inviteUrl})`
    );
    user = await findUserByEmail(email);

    if (!user) {
      // Directus sends the invite synchronously but the user row should
      // exist immediately after — if it's still missing, something's wrong
      // upstream and retrying blindly could send duplicate invite emails.
      throw new Error(
        `Invited ${email} but could not find the resulting Directus user`
      );
    }
    console.log(
      `[membership] found newly-invited Directus user ${user.id} for ${email}`
    );
  } else {
    console.log(
      `[membership] found existing Directus user ${user.id} for ${email}`
    );
  }

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
 * TODO: nothing in pages/account currently reads payment_failed_at — surface
 * a "payment failed" notice in the account section once there's a design for it.
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
