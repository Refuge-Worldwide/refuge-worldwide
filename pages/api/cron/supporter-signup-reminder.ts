import type { NextApiRequest, NextApiResponse } from "next";
import { readUsers } from "@directus/sdk";
import dayjs from "dayjs";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import { getAppUserRoleId } from "@/lib/membership";
import { sendWelcomeCompletePaymentEmail } from "@/lib/resend/email";
import { sendSlackMessage } from "@/lib/slack";
import { RESEND_RATE_LIMIT_DELAY } from "@/constants";

/**
 * Runs once daily. Nudges app-door signups (Door B — see
 * lib/membership.ts/pages/api/auth/signup.ts) who still haven't completed
 * their Supporter payment ~24h after signing up. A date_created window
 * (24-48h ago) gives a one-time-per-user reminder without needing a
 * "reminder already sent" field — there's no version-controlled Directus
 * schema to add one to.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    !process.env.CRON_SECRET ||
    req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ success: false });
  }

  try {
    const roleId = await getAppUserRoleId();
    const windowStart = dayjs().subtract(48, "hours").toISOString();
    const windowEnd = dayjs().subtract(24, "hours").toISOString();

    const users = await directusMembershipAdmin.request(
      readUsers({
        filter: {
          role: { _eq: roleId },
          date_created: { _between: [windowStart, windowEnd] },
          subscription_status: { _null: true },
        } as unknown as Record<string, unknown>,
        fields: ["id", "email", "first_name"],
        limit: -1,
      })
    );

    console.log(
      `[supporter-signup-reminder] found ${users.length} user(s) to nudge`
    );

    for (const user of users as unknown as {
      id: string;
      email: string;
      first_name?: string | null;
    }[]) {
      try {
        await sendWelcomeCompletePaymentEmail(
          user.email,
          user.first_name || "there",
          true
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RESEND_RATE_LIMIT_DELAY)
        );
      } catch (error) {
        console.error(
          `[supporter-signup-reminder] failed to email ${user.email}:`,
          error
        );
        await sendSlackMessage(
          `[supporter-signup-reminder] failed to send account-setup reminder to ${user.email}. ${error.message}`,
          "error"
        );
      }
    }

    return res.status(200).json({ success: true, count: users.length });
  } catch (error) {
    console.error("[supporter-signup-reminder] failed:", error);
    await sendSlackMessage(
      `[supporter-signup-reminder] cron run failed entirely: ${error.message}`,
      "error"
    );
    return res.status(400).json({ success: false, message: error.message });
  }
}
