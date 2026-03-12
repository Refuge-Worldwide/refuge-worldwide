import { mollie } from "./config";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Admin client with service role key for server-side operations
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);

/**
 * Store Mollie customer ID in Supabase
 */
export async function upsertMollieCustomerToSupabase(
  uuid: string,
  mollieCustomerId: string
) {
  const { data: existing } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("id", uuid)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from("customers")
      .update({ mollie_customer_id: mollieCustomerId })
      .eq("id", uuid);

    if (error) {
      throw new Error(`Failed to update Mollie customer: ${error.message}`);
    }
  } else {
    const { error } = await supabaseAdmin
      .from("customers")
      .insert({ id: uuid, mollie_customer_id: mollieCustomerId });

    if (error) {
      throw new Error(`Failed to insert Mollie customer: ${error.message}`);
    }
  }

  return mollieCustomerId;
}

/**
 * Create a new customer in Mollie
 */
export async function createMollieCustomer(uuid: string, email: string) {
  const customer = await mollie.customers.create({
    email,
    metadata: JSON.stringify({ supabaseUUID: uuid }),
  });

  return customer.id;
}

/**
 * Get or create a Mollie customer for a user
 */
export async function createOrRetrieveMollieCustomer({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) {
  // Check if customer already exists in Supabase
  const { data: existingCustomer, error: queryError } = await supabaseAdmin
    .from("customers")
    .select("mollie_customer_id")
    .eq("id", uuid)
    .maybeSingle();

  if (queryError) {
    throw new Error(`Customer lookup failed: ${queryError.message}`);
  }

  // If we have a Mollie customer ID, verify it exists in Mollie
  if (existingCustomer?.mollie_customer_id) {
    try {
      await mollie.customers.get(existingCustomer.mollie_customer_id);
      return existingCustomer.mollie_customer_id;
    } catch {
      // Customer doesn't exist in Mollie, create a new one
    }
  }

  // Create new Mollie customer
  const mollieCustomerId = await createMollieCustomer(uuid, email);
  await upsertMollieCustomerToSupabase(uuid, mollieCustomerId);

  return mollieCustomerId;
}

/**
 * Create a subscription in Mollie (called after first payment succeeds)
 */
export async function createMollieSubscription(
  customerId: string,
  userId: string,
  options: {
    amount: string;
    interval: string;
    description: string;
    plan: string;
    tier: string;
  } = {
    amount: "3.00",
    interval: "1 month",
    description: "Refuge Worldwide Supporter - Monthly",
    plan: "supporter_monthly",
    tier: "supporter",
  }
) {
  const subscription = await mollie.customerSubscriptions.create({
    customerId,
    amount: { currency: "EUR", value: options.amount },
    interval: options.interval,
    description: options.description,
    webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mollie/webhook`,
    metadata: JSON.stringify({
      userId,
      plan: options.plan,
      tier: options.tier,
    }),
  });

  return subscription;
}

/**
 * Update subscription status in Supabase
 */
export async function updateSubscriptionInSupabase(
  subscriptionId: string,
  userId: string,
  status: Database["public"]["Enums"]["subscription_status"],
  periodStart?: Date,
  periodEnd?: Date
) {
  const { error } = await supabaseAdmin.from("subscriptions").upsert({
    id: subscriptionId,
    user_id: userId,
    status,
    current_period_start:
      periodStart?.toISOString() || new Date().toISOString(),
    current_period_end:
      periodEnd?.toISOString() ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
}

/**
 * Cancel a subscription in Mollie
 */
export async function cancelMollieSubscription(
  customerId: string,
  subscriptionId: string
) {
  await mollie.customerSubscriptions.cancel(subscriptionId, { customerId });
}

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "past_due", "trialing"])
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get subscription: ${error.message}`);
  }

  return data;
}

export { supabaseAdmin };
