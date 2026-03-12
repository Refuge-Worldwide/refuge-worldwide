import type { NextApiRequest, NextApiResponse } from "next";
import {
  cancelMollieSubscription,
  getUserSubscription,
  supabaseAdmin,
} from "@/lib/mollie/admin";
import createClient from "@/lib/supabase/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient(req, res);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get user's active subscription
    const subscription = await getUserSubscription(user.id);

    if (!subscription) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    // Get Mollie customer ID
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("mollie_customer_id")
      .eq("id", user.id)
      .single();

    if (!customer?.mollie_customer_id) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Cancel in Mollie
    await cancelMollieSubscription(
      customer.mollie_customer_id,
      subscription.id
    );

    // Update status in Supabase
    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
        cancel_at_period_end: true,
      })
      .eq("id", subscription.id);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to cancel subscription",
    });
  }
}
