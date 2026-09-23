import { createHash } from "crypto";
import { sendSlackMessage } from "@/lib/slack";
type MailchimpError = {
  title: string;
  status: number;
  detail: string;
  instance: string;
};

export type NewsletterResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; error: string };

export async function subscribeToNewsletter(
  email: string,
  firstName?: string
): Promise<NewsletterResult> {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID;
  const API_KEY = process.env.MAILCHIMP_API_KEY;

  if (!LIST_ID || !API_KEY) {
    return { ok: false, error: "Mailchimp is not configured" };
  }

  // API keys are in the form <key>-us3.
  const datacenter = API_KEY.split("-")[1];

  const response = await fetch(
    `https://${datacenter}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
    {
      method: "POST",
      headers: {
        Authorization: `apikey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        ...(firstName ? { merge_fields: { FNAME: firstName } } : {}),
      }),
    }
  );

  if (response.status >= 400) {
    const message: MailchimpError = await response.json();
    if (message.title === "Member Exists") {
      return { ok: true, alreadySubscribed: true };
    }
    return { ok: false, error: message.detail ?? message.title };
  }

  return { ok: true, alreadySubscribed: false };
}

// never throws — a Mailchimp outage shouldn't block signup
export async function subscribeNewUser(email: string, firstName?: string) {
  try {
    const result = await subscribeToNewsletter(email, firstName);
    if (result.ok === false) {
      await sendSlackMessage(
        `[newsletter] could not subscribe ${email} at signup: ${result.error}`,
        "error"
      );
    }
  } catch (error) {
    await sendSlackMessage(
      `[newsletter] could not subscribe ${email} at signup: ${error.message}`,
      "error"
    );
  }
}

// Mailchimp's DELETE just archives, doesn't erase
export async function unsubscribeFromNewsletter(
  email: string
): Promise<NewsletterResult> {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID;
  const API_KEY = process.env.MAILCHIMP_API_KEY;

  if (!LIST_ID || !API_KEY) {
    return { ok: false, error: "Mailchimp is not configured" };
  }

  const datacenter = API_KEY.split("-")[1];
  const hash = createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");

  const response = await fetch(
    `https://${datacenter}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/${hash}`,
    { method: "DELETE", headers: { Authorization: `apikey ${API_KEY}` } }
  );

  if (response.status === 404) return { ok: true, alreadySubscribed: false };
  if (response.status >= 400) {
    const message: MailchimpError = await response.json().catch(() => null);
    return { ok: false, error: message?.detail ?? `HTTP ${response.status}` };
  }
  return { ok: true, alreadySubscribed: false };
}

// never throws — a Mailchimp outage shouldn't block deletion
export async function unsubscribeDeletedUser(email: string) {
  try {
    const result = await unsubscribeFromNewsletter(email);
    if (result.ok === false) {
      await sendSlackMessage(
        `[newsletter] could not remove ${email} from Mailchimp after account deletion: ${result.error}`,
        "error"
      );
    }
  } catch (error) {
    await sendSlackMessage(
      `[newsletter] could not remove ${email} from Mailchimp after account deletion: ${error.message}`,
      "error"
    );
  }
}
