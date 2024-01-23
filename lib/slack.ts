const slackURL = process.env.SLACK_WEBHOOK_URL;
const slackDevURL = process.env.SLACK_DEV_WEBHOOK_URL;

export function sendSlackMessage(text: string, channel?: string) {
  let url = slackURL;
  if (channel && channel == "dev") {
    url = slackDevURL;
  }
  fetch(url, {
    method: "POST",
    body: JSON.stringify({
      text: text,
    }),
  });
}
