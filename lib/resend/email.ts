import { Resend } from "resend";
import ShowSubmissionEmail from "../../emails/showSubmission";
import { ShowArtworkEmail } from "../../emails/showArtwork";
const resend = new Resend(process.env.RESEND_API_KEY);
import { sendSlackMessage } from "../../lib/slack";
import dayjs from "dayjs";

export async function sendEmail(artist, show, severity) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Refuge Worldwide <noreply@mail.refugeworldwide.com>",
      to: artist.email,
      subject: subject(severity),
      reply_to: ["leona@refugeworldwide.com", "graeme@refugeworldwide.com"],
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
            to: artist.email,
            subject:
              "Show confirmation - " + dayjs(show.start).format("MMM YYYY"),
            reply_to: [
              "leona@refugeworldwide.com",
              "graeme@refugeworldwide.com",
            ],
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

export async function sendArtworkEmail(artist, date) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Refuge Worldwide <noreply@mail.refugeworldwide.com>",
      to: artist.email,
      subject:
        "Your show artwork for " + dayjs(date).format("dddd") + " is now ready",
      reply_to: [
        "leona@refugeworldwide.com",
        "graeme@refugeworldwide.com",
        "maria@refugeworldwide.com",
        "irene@refugeworldwide.com",
      ],
      react: ShowArtworkEmail({
        userName: artist.name,
        showDate: date,
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
