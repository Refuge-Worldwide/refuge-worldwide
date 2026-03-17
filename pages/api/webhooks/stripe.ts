import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/config";
import { manageSubscriptionStatusChange } from "@/lib/supabase/admin";

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const buf = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (!sig || !webhookSecret) {
      return res.status(400).json({ error: "Webhook secret not found." });
    }
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    console.log(`Webhook received: ${event.type}`);
  } catch (err: any) {
    console.error(`Webhook error: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (relevantEvents.has(event.type)) {
    try {
      const subscription = event.data.object as Stripe.Subscription;
      await manageSubscriptionStatusChange(
        subscription.id,
        subscription.customer as string,
        event.type === "customer.subscription.created"
      );
    } catch (error) {
      console.error("Webhook handler error:", error);
      return res.status(400).json({ error: "Webhook handler failed." });
    }
  }

  return res.status(200).json({ received: true });
}
