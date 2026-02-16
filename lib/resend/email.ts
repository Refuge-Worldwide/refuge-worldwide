import { Resend } from "resend";
import ShowSubmissionEmail from "../../emails/showSubmission";
import { ShowArtworkEmail } from "../../emails/showArtwork";
const resend = new Resend(process.env.RESEND_API_KEY);
import { sendSlackMessage } from "../../lib/slack";
import dayjs from "dayjs";

const replyToEmails = [
  "leona@refugeworldwide.com",
  "assistant@refugeworldwide.com",
];

export async function sendEmail(artist, show, severity) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Refuge Worldwide <noreply@mail.refugeworldwide.com>",
      to:
        process.env.NODE_ENV === "development"
          ? "jack@refugeworldwide.com"
          : artist.email,
      subject: subject(severity),
      reply_to: replyToEmails,
      react: ShowSubmissionEmail({
        userName: artist.name,
        showDateStart: show.date,
        showDateEnd: show.dateEnd,
        showType: show.type,
        severity: severity,
        showId: show.sys.id,
      }),
    });

    if (error) {
      throw new Error(error.name);
    }

    return data;
  } catch (error) {
    // send message to slack saying there was an issue sending the email
    console.log(error);
    sendSlackMessage(
      `Failed to send email request to ${artist.name}(${artist.email}) on show *${show.title}*. ${error.name} - ${error.message}. <@U04HG3VHHEW>`
    );
  }
}

export async function sendConfirmationEmail(show) {
  await Promise.all(
    show.artists.map(async (artist) => {
      if (artist.email) {
        try {
          const { data, error } = await resend.emails.send({
            from: "Refuge Worldwide <noreply@mail.refugeworldwide.com>",
            to:
              process.env.NODE_ENV === "development"
                ? "jack@refugeworldwide.com"
                : artist.email,
            subject:
              "Show confirmation - " + dayjs(show.start).format("MMM YYYY"),
            reply_to: replyToEmails,
            react: ShowSubmissionEmail({
              userName: artist.label,
              showDateStart: show.start,
              showDateEnd: show.end,
              showType: show.type,
              severity: "confirmation",
              showId: show.id,
            }),
          });

          if (error) {
            throw new Error(error.name);
          }

          return data;
        } catch (error) {
          // send message to slack saying there was an issue sending the email
          console.log(error);
          sendSlackMessage(
            `Failed to send email request to ${artist.name}(${artist.email}) on show *${show.title}*. ${error.name} - ${error.message}. <@U04HG3VHHEW>`,
            "error"
          );
        }
      }
    })
  );
}

export async function sendArtworkEmail(artist, date, artwork) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Refuge Worldwide <noreply@mail.refugeworldwide.com>",
      to:
        process.env.NODE_ENV === "development"
          ? "jack@refugeworldwide.com"
          : artist.email,
      subject:
        "Your show artwork for " + dayjs(date).format("dddd") + " is now ready",
      reply_to: ["leona@refugeworldwide.com", "assistant@refugeworldwide.com"],
      react: ShowArtworkEmail({
        userName: artist.name,
        showDate: date,
        artwork: artwork,
      }),
    });

    if (error) {
      throw new Error(error.name);
    }

    return data;
  } catch (error) {
    // send message to slack saying there was an issue sending the email
    console.log(error);
    sendSlackMessage(
      `Failed to send artwork email to ${artist.name}(${artist.email}). ${error.name} - ${error.message}. <@U04HG3VHHEW>`,
      "error"
    );
  }
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
