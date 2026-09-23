import type { NextApiRequest, NextApiResponse } from "next";
import { deleteUser } from "@directus/sdk";
import { stripe } from "@/lib/stripe/config";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import {
  clearSessionCookies,
  directusUrl,
  getValidAccessToken,
} from "@/lib/directus/session";
import { sendSlackMessage } from "@/lib/slack";
import { unsubscribeDeletedUser } from "@/lib/mailchimp";

// cancels Stripe first — if that fails, leave the account alone
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const bearer = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  const token = bearer ?? (await getValidAccessToken(req, res));
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let me: { id: string; email: string; stripe_subscription_id?: string | null };
  try {
    const meRes = await fetch(
      `${directusUrl}/users/me?fields=id,email,stripe_subscription_id`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!meRes.ok) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    me = (await meRes.json()).data;
  } catch (error) {
    console.error("[api/auth/delete-account] session lookup failed:", error);
    return res.status(500).json({ error: "Could not delete your account" });
  }

  if (me.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(me.stripe_subscription_id);
    } catch (error) {
      if (error?.code !== "resource_missing") {
        // already cancelled on Stripe's side
        console.error("[api/auth/delete-account] cancel failed:", error);
        await sendSlackMessage(
          `[delete-account] could not cancel subscription ${me.stripe_subscription_id} for ${me.email}: ${error.message}`,
          "error"
        );
        return res.status(500).json({
          error:
            "We couldn't cancel your subscription, so your account was not deleted. Please email support@refugeworldwide.com.",
        });
      }
    }
  }

  try {
    await directusMembershipAdmin.request(deleteUser(me.id));
  } catch (error) {
    console.error("[api/auth/delete-account] deleteUser failed:", error);
    await sendSlackMessage(
      `[delete-account] subscription cancelled but the account for ${me.email} could not be deleted: ${error.message}`,
      "error"
    );
    return res.status(500).json({ error: "Could not delete your account" });
  }

  await unsubscribeDeletedUser(me.email);

  clearSessionCookies(res);
  return res.status(200).json({ ok: true });
}
