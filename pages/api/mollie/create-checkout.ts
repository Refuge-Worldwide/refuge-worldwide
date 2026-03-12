import type { NextApiRequest, NextApiResponse } from "next";
import { mollie } from "@/lib/mollie/config";
import { createOrRetrieveMollieCustomer } from "@/lib/mollie/admin";
import createClient from "@/lib/supabase/api";
import { SequenceType } from "@mollie/api-client";

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
    // Get or create Mollie customer
    const mollieCustomerId = await createOrRetrieveMollieCustomer({
      email: user.email!,
      uuid: user.id,
    });

    // Create first payment to set up the subscription
    // Mollie requires a successful first payment before creating a subscription
    const payment = await mollie.payments.create({
      amount: { currency: "EUR", value: "5.00" },
      customerId: mollieCustomerId,
      sequenceType: SequenceType.first,
      description: "Refuge Worldwide Supporter - First Payment",
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/supporters/success`,
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mollie/webhook`,
      metadata: JSON.stringify({
        userId: user.id,
        type: "subscription_first",
      }),
    });

    const checkoutUrl = payment.getCheckoutUrl();

    if (!checkoutUrl) {
      return res.status(500).json({ error: "Failed to get checkout URL" });
    }

    return res.status(200).json({ checkoutUrl });
  } catch (error) {
    console.error("Mollie checkout error:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to create checkout",
    });
  }
}
