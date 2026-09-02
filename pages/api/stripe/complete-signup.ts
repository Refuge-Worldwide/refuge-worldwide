import type { NextApiRequest, NextApiResponse } from "next";
import { updateUser } from "@directus/sdk";
import { stripe } from "@/lib/stripe/config";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import { directusUrl, setSessionCookies } from "@/lib/directus/session";
import {
  fieldsFromSubscription,
  findOrCreateUser,
  getAppUserRoleId,
} from "@/lib/membership";
import { sendSlackMessage } from "@/lib/slack";

/**
 * Called from the /supporters/success page right after a Stripe Checkout
 * completes. Sets a real, user-chosen password on the Directus account (no
 * emailed invite/token — the Stripe session_id is the proof of authorization)
 * and logs them straight in.
 *
 * "No account yet" and "account exists but never had a real password set"
 * are treated the same way here — both get the submitted password/username
 * written, tracked via Directus's own status field ("invited" = placeholder
 * password nobody has seen, "active" = real password set). The latter case
 * is real: the webhook's silent fallback (upsertSupporterFromCheckout) can
 * create an "invited" account if the customer paid but never returned to
 * this page. Once status is "active", this never touches the password
 * again — a repeat call just refreshes subscription fields and attempts a
 * login with whatever was submitted, which fails harmlessly if that's not
 * a match.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    session_id: sessionId,
    password,
    username,
  } = req.body as {
    session_id?: string;
    password?: string;
    username?: string;
  };

  if (!sessionId || !password || !username?.trim()) {
    return res
      .status(400)
      .json({ error: "session_id, password and username are required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  let email: string | undefined;
  let subscriptionId: string | null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ error: "This session hasn't completed payment yet" });
    }
    email = session.customer_details?.email ?? undefined;
    subscriptionId = session.subscription as string | null;
  } catch (error) {
    console.error("[api/stripe/complete-signup] session lookup failed:", error);
    sendSlackMessage(
      `[complete-signup] failed to verify session ${sessionId}: ${error.message}`,
      "error"
    );
    return res.status(400).json({ error: "Could not verify that session" });
  }

  if (!email || !subscriptionId) {
    return res
      .status(400)
      .json({ error: "This session is missing an email or subscription" });
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const fields = fieldsFromSubscription(subscription) as unknown as Record<
    string,
    unknown
  >;

  const roleId = await getAppUserRoleId();

  let user;
  try {
    // Handles the create-vs-already-exists branching and the inherent race
    // against the webhook's silent fallback (or a double-submit of this
    // same request) creating the same account first.
    user = await findOrCreateUser(email, {
      password,
      first_name: username.trim(),
      role: roleId,
      status: "active",
    });
  } catch (error) {
    sendSlackMessage(
      `[complete-signup] a paid customer (${email}, session ${sessionId}) could not get an account created — needs manual follow-up. ${error.message}`,
      "error"
    );
    return res.status(500).json({ error: "Could not create your account" });
  }

  // True for a brand new account, and for one that already existed but
  // never got a real password (the webhook-fallback case above, status
  // "invited"). "active" means someone already completed setup elsewhere.
  const needsSetup = user.status !== "active";

  await directusMembershipAdmin.request(
    updateUser(user.id, {
      ...fields,
      ...(needsSetup
        ? {
            password,
            first_name: username.trim(),
            status: "active",
          }
        : {}),
    })
  );

  // Never write a password beyond the needsSetup branch above — if the
  // account already had one, this is just an auth check with whatever the
  // customer submitted, which fails harmlessly if it doesn't match.
  const loginRes = await fetch(`${directusUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, mode: "json" }),
  });

  if (!loginRes.ok) {
    console.log(
      `[api/stripe/complete-signup] login failed after ${
        needsSetup ? "completing setup for" : "finding an already-set-up"
      } account for ${email}`
    );
    if (needsSetup) {
      // We just set this exact password — login should always succeed
      // immediately after. This is a real problem, not the benign
      // "already set up elsewhere, different password" case.
      sendSlackMessage(
        `[complete-signup] set up an account for ${email} (session ${sessionId}) but the immediate login failed — needs manual follow-up.`,
        "error"
      );
    }
    return res.status(200).json({ ok: true, loggedIn: false });
  }

  const { data } = await loginRes.json();
  setSessionCookies(res, data);
  return res.status(200).json({ ok: true, loggedIn: true });
}
