import type { NextApiRequest, NextApiResponse } from "next";
import createClient from "@/lib/supabase/api";
import { stripe, PLANS, type PlanId } from "@/lib/stripe/config";
import { createOrRetrieveCustomer } from "@/lib/supabase/admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { planId, amount } = req.body as { planId: PlanId; amount: number };

  const plan = PLANS[planId];
  if (!plan) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  const minEuros = plan.minAmount / 100;
  if (!amount || amount < minEuros) {
    return res
      .status(400)
      .json({ error: `Minimum amount is €${minEuros.toFixed(2)}` });
  }

  const supabase = createClient(req, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const productId = process.env[plan.productEnvKey];
  if (!productId) {
    console.error(`Missing env var: ${plan.productEnvKey}`);
    return res.status(500).json({ error: "Plan not configured" });
  }

  try {
    let customerId: string;
    if (user) {
      customerId = await createOrRetrieveCustomer({
        email: user.email!,
        uuid: user.id,
      });
    } else {
      // Guest — email captured by Stripe PaymentElement on submit
      const customer = await stripe.customers.create({});
      customerId = customer.id;
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: {
            currency: "eur",
            product: productId,
            unit_amount: Math.round(amount * 100),
            recurring: { interval: plan.interval },
          },
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payments"],
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntentId =
      invoice?.payments?.data?.[0]?.payment?.payment_intent;

    if (!paymentIntentId) {
      return res.status(500).json({ error: "Failed to get payment intent" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const clientSecret = paymentIntent.client_secret;

    if (!clientSecret) {
      return res.status(500).json({ error: "Failed to get payment intent" });
    }

    return res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (error: any) {
    console.error("Create subscription error:", error);
    return res
      .status(500)
      .json({ error: error.message ?? "Failed to create subscription" });
  }
}
