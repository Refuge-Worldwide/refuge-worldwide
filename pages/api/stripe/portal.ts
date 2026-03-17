import type { NextApiRequest, NextApiResponse } from "next";
import createClient from "@/lib/supabase/api";
import { stripe } from "@/lib/stripe/config";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!customer?.stripe_customer_id) {
    return res.status(404).json({ error: "No Stripe customer found" });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Portal session error:", error);
    return res
      .status(500)
      .json({ error: error.message ?? "Failed to create portal session" });
  }
}
