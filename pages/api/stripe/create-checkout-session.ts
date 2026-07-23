import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe/config";

const ALLOWED_AMOUNTS_EUR = [5, 7.5, 15, 30, 50, 100];
const ALLOWED_INTERVALS = ["month", "year"] as const;

function lookupKeyFor(amountEur: number, interval: string): string {
  const amountKey = String(amountEur).replace(".", "_");
  return `supporter_${amountKey}_${interval}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amountEur, interval } = req.body as {
    amountEur?: number;
    interval?: string;
  };

  if (!amountEur || !ALLOWED_AMOUNTS_EUR.includes(amountEur)) {
    return res.status(400).json({ error: "Invalid amount" });
  }
  if (
    !interval ||
    !ALLOWED_INTERVALS.includes(interval as (typeof ALLOWED_INTERVALS)[number])
  ) {
    return res.status(400).json({ error: "Invalid interval" });
  }

  const lookupKey = lookupKeyFor(amountEur, interval);
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    limit: 1,
  });
  const price = prices.data[0];

  if (!price) {
    console.error(`[create-checkout-session] no price found for ${lookupKey}`);
    return res
      .status(500)
      .json({ error: "That tier isn't available right now" });
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  ).replace(/\/$/, "");

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ui_mode: "embedded",
      line_items: [{ price: price.id, quantity: 1 }],
      return_url: `${baseUrl}/supporters/success?session_id={CHECKOUT_SESSION_ID}`,
      // Auto-localizes the displayed/charged amount for customers outside
      // the Eurozone — no extra Price objects to maintain. No-ops if the
      // Stripe account isn't eligible for it.
      adaptive_pricing: { enabled: true },
    });

    return res.status(200).json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("[create-checkout-session] failed:", error);
    return res.status(500).json({ error: "Failed to start checkout" });
  }
}
