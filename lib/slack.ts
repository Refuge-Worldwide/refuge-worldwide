const slackURL = process.env.SLACK_WEBHOOK_URL;
const slackDevURL = process.env.SLACK_DEV_WEBHOOK_URL;
const slackErrorURL = process.env.SLACK_ERROR_WEBHOOK_URL;

// Callers should await this: on Vercel, work left running after the
// response is sent can be cut off, silently dropping the alert.
export async function sendSlackMessage(text: string, channel?: string) {
  const urlMap = {
    error: slackErrorURL,
    dev: slackDevURL,
  };

  const url = urlMap[channel] || slackURL;

  if (!url) {
    console.error(
      `[slack] no webhook URL configured for channel "${
        channel ?? "default"
      }" — dropped message:`,
      text
    );
    return;
  }

  await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      text: text,
    }),
  }).catch((error) => {
    console.error("[slack] failed to send message:", error);
  });
}
