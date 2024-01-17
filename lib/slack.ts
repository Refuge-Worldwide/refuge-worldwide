const slackURL = process.env.SLACK_WEBHOOK_URL;

export function sendSlackMessage(text: string) {
  fetch(slackURL, {
    method: "POST",
    body: JSON.stringify({
      text: text,
    }),
  });
}
