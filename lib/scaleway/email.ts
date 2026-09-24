import type { ReactElement } from "react";
import { render } from "@react-email/components";
import { WelcomeCompletePaymentEmail } from "../../emails/welcomeCompletePayment";
import { WelcomeSupporterEmail } from "../../emails/welcomeSupporter";
import { sendSlackMessage } from "../../lib/slack";

const FROM = {
  email: "noreply@mail.refugeworldwide.com",
  name: "Refuge Worldwide",
};
const REPLY_TO = "assistant@refugeworldwide.com";

async function send(to: string, subject: string, react: ReactElement) {
  const region = process.env.SCALEWAY_REGION ?? "fr-par";
  const res = await fetch(
    `https://api.scaleway.com/transactional-email/v1alpha1/regions/${region}/emails`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": process.env.SCALEWAY_SECRET_KEY,
      },
      body: JSON.stringify({
        from: FROM,
        to: [{ email: to }],
        subject,
        html: render(react),
        text: render(react, { plainText: true }),
        project_id: process.env.SCALEWAY_PROJECT_ID,
        additional_headers: [{ key: "Reply-To", value: REPLY_TO }],
      }),
    }
  );

  if (!res.ok) {
    const error = new Error(await res.text());
    error.name = `Scaleway ${res.status}`;
    throw error;
  }

  return res.json();
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  ).replace(/\/$/, "");
}

// Sent to app signups (account created without paying yet). The reminder
// variant is for the supporter-signup-reminder cron, currently unscheduled.
export async function sendWelcomeCompletePaymentEmail(
  email: string,
  userName: string,
  reminder: boolean = false
) {
  try {
    return await send(
      email,
      reminder
        ? "Don't forget to complete your account setup"
        : "Welcome to Refuge Worldwide — confirm your account and activate your subscription",
      WelcomeCompletePaymentEmail({
        userName,
        supportersUrl: `${siteUrl()}/supporters/checkout?email=${encodeURIComponent(
          email
        )}`,
        reminder,
      })
    );
  } catch (error) {
    console.log(error);
    await sendSlackMessage(
      `Failed to send ${
        reminder ? "reminder" : "welcome"
      } payment email to ${email}. ${error.name} - ${
        error.message
      }. <@U04HG3VHHEW>`,
      "error"
    );
  }
}

// Sent once, right after checkout.session.completed confirms payment — see
// upsertSupporterFromCheckout in lib/membership.ts.
export async function sendWelcomeSupporterEmail(
  email: string,
  userName: string
) {
  try {
    return await send(
      email,
      "Thank you for supporting Refuge Worldwide ",
      WelcomeSupporterEmail({ userName })
    );
  } catch (error) {
    console.log(error);
    await sendSlackMessage(
      `Failed to send welcome supporter email to ${email}. ${error.name} - ${error.message}. <@U04HG3VHHEW>`,
      "error"
    );
  }
}
