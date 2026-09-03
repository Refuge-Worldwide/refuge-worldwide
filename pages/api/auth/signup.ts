import type { NextApiRequest, NextApiResponse } from "next";
import { createUser } from "@directus/sdk";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import { findUserByEmail, getAppUserRoleId } from "@/lib/membership";
import { sendSlackMessage } from "@/lib/slack";
import { getClientIp } from "@/lib/signupRateLimit";

/**
 * Public self-serve signup — this is Door B (app-first): the mobile app
 * can't take payment, so it creates the account here directly (no invite,
 * no email needed to get in) and pays later from the website. Called
 * cross-origin from the app. Just creates the account — the app logs the
 * user in itself afterward via its own existing `directus.login()` call,
 * same as its normal sign-in path, so no tokens need to travel through
 * this response.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, username } = req.body as {
    email?: string;
    password?: string;
    username?: string;
  };

  if (!email || !password || !username?.trim()) {
    return res
      .status(400)
      .json({ error: "Email, password and username are required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  // IP rate limiting is on hold for now — see lib/signupRateLimit.ts.
  // Still capturing the IP below so it's there if we turn it back on.
  const ip = getClientIp(req);

  let existing;
  try {
    existing = await findUserByEmail(email);
  } catch (error) {
    console.error("[api/auth/signup] existence check failed:", error);
    sendSlackMessage(
      `[signup] existence check failed for ${email}: ${error.message}`,
      "error"
    );
    return res.status(500).json({ error: "Could not create your account" });
  }
  if (existing) {
    return res.status(409).json({
      error: "An account already exists for that email — sign in instead",
    });
  }

  const roleId = await getAppUserRoleId();

  try {
    await directusMembershipAdmin.request(
      createUser({
        email,
        password,
        first_name: username.trim(),
        role: roleId,
        signup_ip: ip,
        // A real, user-chosen password from the start — status "active"
        // means this account never needs the /supporters/success setup
        // form even if they later pay on the website (see
        // complete-signup.ts's needsSetup check).
        status: "active",
      } as unknown as Record<string, unknown>)
    );
  } catch (error) {
    console.error("[api/auth/signup] createUser failed:", error);
    sendSlackMessage(
      `[signup] failed to create an account for ${email}: ${error.message}`,
      "error"
    );
    return res.status(500).json({ error: "Could not create your account" });
  }

  // Deliberately not sending an email here for now — the
  // "complete your payment" framing (sendWelcomeCompletePaymentEmail, see
  // lib/resend/email.ts) is specific to this signup route and about to be
  // replaced by a single general "account created" email that fires the
  // same way regardless of which door (app-first or web-first) created
  // the account.

  return res.status(200).json({ ok: true });
}
