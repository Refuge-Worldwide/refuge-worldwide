import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe/config";
import { findUserByEmail } from "@/lib/membership";
import { sendSlackMessage } from "@/lib/slack";

// Read-only check the /supporters/success page calls on load to decide
// whether to show a "set your password" form or a "you already have an
// account, sign in" message. hasAccount really means "has completed setup"
// (Directus status is "active") — an account can exist but still need the
// form, e.g. one created by the webhook's silent fallback with status
// "invited" and a random placeholder password nobody has ever seen. No side
// effects — account creation/setup itself happens in complete-signup.ts.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { session_id: sessionId } = req.query as { session_id?: string };
  if (!sessionId) {
    return res.status(400).json({ error: "session_id is required" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ error: "This session hasn't completed payment yet" });
    }

    const email = session.customer_details?.email;
    if (!email) {
      return res.status(400).json({ error: "No email found for this session" });
    }

    const existingUser = await findUserByEmail(email);

    return res
      .status(200)
      .json({ email, hasAccount: existingUser?.status === "active" });
  } catch (error) {
    console.error("[api/stripe/session-status] failed:", error);
    sendSlackMessage(
      `[session-status] failed to verify session ${sessionId}: ${error.message}`,
      "error"
    );
    return res.status(400).json({ error: "Could not verify that session" });
  }
}
