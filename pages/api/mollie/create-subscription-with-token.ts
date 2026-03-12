import type { NextApiRequest, NextApiResponse } from "next";
import { mollie } from "@/lib/mollie/config";
import { PaymentMethod } from "@mollie/api-client";
import {
  createOrRetrieveMollieCustomer,
  updateSubscriptionInSupabase,
} from "@/lib/mollie/admin";
import createClient from "@/lib/supabase/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { cardToken } = req.body;

  if (!cardToken) {
    return res.status(400).json({ error: "Card token is required" });
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

    // Create payment using the card token
    // This is the first payment which will set up the mandate for recurring payments
    const payment = await mollie.payments.create({
      amount: { currency: "EUR", value: "5.00" },
      customerId: mollieCustomerId,
      description: "Refuge Worldwide Supporter - First Payment",
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mollie/webhook`,
      method: PaymentMethod.creditcard,
      cardToken,
      metadata: JSON.stringify({
        userId: user.id,
        type: "subscription_first",
      }),
    });

    // Check if payment needs 3D Secure or other redirect
    const checkoutUrl = payment._links?.checkout?.href;

    if (checkoutUrl) {
      // Payment requires additional authentication (3D Secure)
      return res.status(200).json({
        requiresAction: true,
        checkoutUrl,
      });
    }

    // Payment was processed immediately (unlikely for first payment)
    if (payment.status === "paid") {
      // Create the subscription
      const subscription = await mollie.customerSubscriptions.create({
        customerId: mollieCustomerId,
        amount: { currency: "EUR", value: "5.00" },
        interval: "1 month",
        description: "Refuge Worldwide Monthly Supporter",
        webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mollie/webhook`,
        metadata: JSON.stringify({ userId: user.id }),
      });

      await updateSubscriptionInSupabase(
        subscription.id,
        user.id,
        "active",
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      );

      return res.status(200).json({ success: true });
    }

    // Payment is pending or has another status
    return res.status(200).json({
      status: payment.status,
      message: "Payment is being processed",
    });
  } catch (error) {
    console.error("Subscription with token error:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to create subscription",
    });
  }
}
