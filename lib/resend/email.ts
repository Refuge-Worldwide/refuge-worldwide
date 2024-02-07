import { Resend } from "resend";
import ShowSubmissionEmail from "../../emails/showSubmission";
const resend = new Resend(process.env.RESEND_API_KEY);
import { sendSlackMessage } from "../../lib/slack";
import dayjs from "dayjs";

export async function sendEmail(artist, show, severity) {
  try {
    const data = await resend.sendEmail({
      from: "Refuge Worldwide <noreply@mail.refugeworldwide.com>",
      to: "jack@refugeworldwide.com",
      // bcc: ["jack@refugeworldwide.com"],
      subject: subject(severity),
      reply_to: [
        "leona@refugeworldwide.com",
        "graeme@refugeworldwide.com",
        "max@refugeworldwide.com",
      ],
      react: ShowSubmissionEmail({
        userName: artist.name,
        showDateStart: show.date,
        showDateEnd: show.dateEnd,
        showType: show.type,
        severity: severity,
        showId: show.sys.id,
      }),
    });
  } catch (err) {
    // send message to slack saying there was an issue sending the email
    console.log(err);
    sendSlackMessage(
      `Failed to send email request to ${artist.name}(${artist.email}) on show *${show.title}*. ${err}. <@U04HG3VHHEW>`
    );
  }
}

export async function sendConfirmationEmail(show) {
  await Promise.all(
    show.artists.map(async (artist) => {
      if (artist.email) {
        try {
          const data = await resend.sendEmail({
            from: "Refuge Worldwide <noreply@mail.refugeworldwide.com>",
            to: "jack@refugeworldwide.com",
            // bcc: ["jack@refugeworldwide.com"],
            subject:
              "Show confirmation - " + dayjs(show.start).format("MMM YYYY"),
            reply_to: [
              "leona@refugeworldwide.com",
              "graeme@refugeworldwide.com",
              "max@refugeworldwide.com",
            ],
            react: ShowSubmissionEmail({
              userName: artist.name,
              showDateStart: show.start,
              showDateEnd: show.end,
              showType: show.type,
              severity: "confirmation",
              showId: show.id,
            }),
          });
        } catch (err) {
          // send message to slack saying there was an issue sending the email
          console.log(err);
          sendSlackMessage(
            `Failed to send email request to ${artist.name}(${artist.email}) on show *${show.title}*. ${err}. <@U04HG3VHHEW>`
          );
        }
      }
    })
  );
}

function subject(severity: string) {
  if (severity == "initial") {
    return "Upcoming show - info required";
  } else if (severity == "follow-up") {
    return "Upcoming show - final call for info!";
  } else {
    return "Upcoming show - your submission is late!";
  }
}
