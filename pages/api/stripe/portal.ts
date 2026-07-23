import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe/config";
import { getSessionUser } from "@/lib/directus/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getSessionUser(req, res, "id,stripe_customer_id");

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!user.stripe_customer_id) {
    return res.status(404).json({ error: "No Stripe customer found" });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
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
