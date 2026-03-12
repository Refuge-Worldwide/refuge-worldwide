import type { NextApiRequest, NextApiResponse } from "next";
import { mollie } from "@/lib/mollie/config";
import { supabaseAdmin } from "@/lib/mollie/admin";
import createClient from "@/lib/supabase/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
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
    // Get the user's Mollie customer ID and subscription from Supabase
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("mollie_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!customer?.mollie_customer_id) {
      return res.status(200).json({ subscription: null });
    }

    // Get the subscription ID from our database
    const { data: subscriptionRecord } = await supabaseAdmin
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .in("status", ["active", "past_due"])
      .maybeSingle();

    if (!subscriptionRecord) {
      return res.status(200).json({ subscription: null });
    }

    // Fetch subscription details from Mollie
    const subscription = await mollie.customerSubscriptions.get(
      subscriptionRecord.id,
      { customerId: customer.mollie_customer_id }
    );

    return res.status(200).json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        amount: subscription.amount,
        interval: subscription.interval,
        description: subscription.description,
        nextPaymentDate: subscription.nextPaymentDate,
        startDate: subscription.startDate,
        canceledAt: subscription.canceledAt,
      },
    });
  } catch (error) {
    console.error("Fetch subscription error:", error);
    // If subscription not found in Mollie, return null
    if ((error as any)?.statusCode === 404) {
      return res.status(200).json({ subscription: null });
    }
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch subscription",
    });
  }
}
