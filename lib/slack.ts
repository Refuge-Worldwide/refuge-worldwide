const slackURL = process.env.SLACK_WEBHOOK_URL;
const slackDevURL = process.env.SLACK_DEV_WEBHOOK_URL;
const slackErrorURL = process.env.SLACK_ERROR_WEBHOOK_URL;

export function sendSlackMessage(text: string, channel?: string) {
  const urlMap = {
    error: slackErrorURL,
    dev: slackDevURL,
  };

  const url = urlMap[channel] || slackURL;

  fetch(url, {
    method: "POST",
    body: JSON.stringify({
      text: text,
    }),
  });
}
