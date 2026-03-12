import type { NextApiRequest, NextApiResponse } from "next";
import { mollie } from "@/lib/mollie/config";
import {
  createMollieSubscription,
  updateSubscriptionInSupabase,
  supabaseAdmin,
} from "@/lib/mollie/admin";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const paymentId = req.body.id;

    if (!paymentId) {
      console.error("No payment ID in webhook");
      return res.status(400).end();
    }

    const payment = await mollie.payments.get(paymentId);
    const metadata = payment.metadata
      ? JSON.parse(payment.metadata as string)
      : {};

    console.log(
      `Webhook received for payment ${paymentId}, status: ${payment.status}`
    );

    if (payment.status === "paid") {
      if (metadata.type === "subscription_first") {
        // First payment successful - create recurring subscription
        console.log(`Creating subscription for user ${metadata.userId}`);

        const subscription = await createMollieSubscription(
          payment.customerId as string,
          metadata.userId
        );

        // Store subscription in Supabase
        await updateSubscriptionInSupabase(
          subscription.id,
          metadata.userId,
          "active",
          new Date(),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );

        console.log(
          `Subscription ${subscription.id} created for user ${metadata.userId}`
        );
      } else if (metadata.type === "subscription_recurring") {
        // Recurring payment successful - update subscription period
        const subscriptionId = payment.subscriptionId;
        if (subscriptionId) {
          await updateSubscriptionInSupabase(
            subscriptionId,
            metadata.userId,
            "active",
            new Date(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          );
        }
      }
    } else if (payment.status === "failed" || payment.status === "expired") {
      // Payment failed
      if (payment.subscriptionId) {
        await updateSubscriptionInSupabase(
          payment.subscriptionId,
          metadata.userId,
          "past_due"
        );
      }
    }

    // Handle subscription-specific webhooks
    if (req.body.subscriptionId) {
      const subscription = await mollie.customerSubscriptions.get(
        req.body.subscriptionId,
        { customerId: req.body.customerId }
      );

      const subMetadata = subscription.metadata
        ? JSON.parse(subscription.metadata as string)
        : {};

      if (subscription.status === "canceled") {
        await updateSubscriptionInSupabase(
          subscription.id,
          subMetadata.userId,
          "canceled"
        );
        console.log(`Subscription ${subscription.id} canceled`);
      }
    }

    return res.status(200).end();
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).end();
  }
}
