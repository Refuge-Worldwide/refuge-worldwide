import type { NextApiRequest, NextApiResponse } from "next";
import { mollie, PLANS, type PlanId } from "@/lib/mollie/config";
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

  const { cardToken, plan } = req.body as { cardToken?: string; plan?: PlanId };
  const planConfig = plan && PLANS[plan];

  if (!cardToken) {
    return res.status(400).json({ error: "Card token is required" });
  }

  if (!planConfig) {
    return res.status(400).json({ error: "Invalid plan" });
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
    const mollieCustomerId = await createOrRetrieveMollieCustomer({
      email: user.email!,
      uuid: user.id,
    });

    const payment = await mollie.payments.create({
      amount: { currency: "EUR", value: planConfig.amount },
      customerId: mollieCustomerId,
      description: `${planConfig.description} - First Payment`,
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mollie/webhook`,
      method: PaymentMethod.creditcard,
      cardToken,
      metadata: JSON.stringify({
        userId: user.id,
        plan,
        tier: planConfig.tier,
        type: "subscription_first",
      }),
    });

    const checkoutUrl = payment._links?.checkout?.href;

    if (checkoutUrl) {
      return res.status(200).json({ requiresAction: true, checkoutUrl });
    }

    if (payment.status === "paid") {
      const subscription = await mollie.customerSubscriptions.create({
        customerId: mollieCustomerId,
        amount: { currency: "EUR", value: planConfig.amount },
        interval: planConfig.interval,
        description: planConfig.description,
        webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mollie/webhook`,
        metadata: JSON.stringify({
          userId: user.id,
          plan,
          tier: planConfig.tier,
        }),
      });

      const periodMs =
        planConfig.interval === "1 year"
          ? 365 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;

      await updateSubscriptionInSupabase(
        subscription.id,
        user.id,
        "active",
        new Date(),
        new Date(Date.now() + periodMs)
      );

      return res.status(200).json({ success: true });
    }

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
