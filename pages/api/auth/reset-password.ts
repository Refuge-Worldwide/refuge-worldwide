import { updateUser } from "@directus/sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import { directusUrl, setSessionCookies } from "@/lib/directus/session";
import { findUserByEmail } from "@/lib/membership";
import { sendSlackMessage } from "@/lib/slack";

// Directus's password-reset token is a signed (not encrypted) JWT containing
// the user's email — Directus's own reset endpoint already validated it by
// the time we read this, so decoding the payload (without verifying the
// signature ourselves) is enough to log the user in immediately afterward.
function decodeResetEmail(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );
    return typeof decoded.email === "string" ? decoded.email : null;
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  const response = await fetch(`${directusUrl}/auth/password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    return res
      .status(400)
      .json({ error: "That reset link is invalid or has expired" });
  }

  // Best-effort: log the user straight in so they don't have to separately
  // sign in right after resetting. If we can't decode their email from the
  // token for any reason, that's fine — the frontend just falls back to
  // showing the normal "Sign in" link, exactly like before this change.
  const email = decodeResetEmail(token);
  if (email) {
    // A password reset is exactly how an incomplete account (Directus
    // status "invited" — e.g. the Stripe webhook's silent placeholder,
    // see lib/membership.ts) is meant to become usable if the customer
    // never went through /supporters/success. Without this, status would
    // stay "invited" forever even though the password now genuinely
    // works, and session-status.ts would keep asking them to "set up" an
    // account they've already fixed. Best-effort — the reset itself
    // already succeeded either way.
    try {
      const user = await findUserByEmail(email);
      if (user && user.status !== "active") {
        await directusMembershipAdmin.request(
          updateUser(user.id, { status: "active" } as unknown as Record<
            string,
            unknown
          >)
        );
      }
    } catch (error) {
      console.error(
        "[api/auth/reset-password] status promotion failed:",
        error
      );
      sendSlackMessage(
        `[reset-password] reset succeeded for ${email} but promoting status to active failed: ${error.message}`,
        "error"
      );
    }

    const loginRes = await fetch(`${directusUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, mode: "json" }),
    });
    if (loginRes.ok) {
      const { data } = await loginRes.json();
      setSessionCookies(res, data);
      return res.status(200).json({ ok: true, loggedIn: true });
    }
  }

  return res.status(200).json({ ok: true, loggedIn: false });
}
