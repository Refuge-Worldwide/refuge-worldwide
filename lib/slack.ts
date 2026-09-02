const slackURL = process.env.SLACK_WEBHOOK_URL;
const slackDevURL = process.env.SLACK_DEV_WEBHOOK_URL;
const slackErrorURL = process.env.SLACK_ERROR_WEBHOOK_URL;

export function sendSlackMessage(text: string, channel?: string) {
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

  fetch(url, {
    method: "POST",
    body: JSON.stringify({
      text: text,
    }),
  }).catch((error) => {
    console.error("[slack] failed to send message:", error);
  });
}
