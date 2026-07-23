import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/config";
import {
  syncSupporterSubscription,
  upsertSupporterFromCheckout,
} from "@/lib/membership";

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  "checkout.session.completed",
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
    // Same TS 5 generic Uint8Array/Buffer tightening as elsewhere — fine at
    // runtime, just needs a cast to satisfy the stricter type.
    req.on("end", () =>
      resolve(Buffer.concat(chunks as unknown as Uint8Array[]))
    );
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
    console.log(`[webhooks/stripe] received ${event.type} (${event.id})`);
  } catch (err: any) {
    console.error(
      `[webhooks/stripe] signature verification failed: ${err.message}`
    );
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (!relevantEvents.has(event.type)) {
    console.log(
      `[webhooks/stripe] ignoring ${event.type} — not in relevantEvents`
    );
    return res.status(200).json({ received: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      const subscriptionId = session.subscription as string | null;

      if (!email || !subscriptionId) {
        console.warn(
          "[webhooks/stripe] checkout.session.completed missing email or subscription",
          { email, subscriptionId }
        );
      } else {
        console.log(
          `[webhooks/stripe] checkout.session.completed for ${email}, subscription ${subscriptionId}`
        );
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        await upsertSupporterFromCheckout(email, subscription);
        console.log(
          `[webhooks/stripe] upsertSupporterFromCheckout completed for ${email}`
        );
      }
    } else {
      // customer.subscription.updated / .deleted
      const subscription = event.data.object as Stripe.Subscription;
      console.log(
        `[webhooks/stripe] ${event.type} for customer ${subscription.customer}, status ${subscription.status}`
      );
      await syncSupporterSubscription(subscription);
      console.log(
        `[webhooks/stripe] syncSupporterSubscription completed for customer ${subscription.customer}`
      );
    }
  } catch (error) {
    console.error(`[webhooks/stripe] handler failed for ${event.type}:`, error);
    return res.status(400).json({ error: "Webhook handler failed." });
  }

  return res.status(200).json({ received: true });
}
