import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import ShowSubmissionEmail from "../../emails/showSubmission";
import dayjs from "dayjs";
import { getUpcomingShowsByDate } from "../../lib/contentful/pages/radio";
import { ShowInterface } from "../../types/shared";
import { sendSlackMessage } from "../../lib/slack";

const resend = new Resend(process.env.RESEND_API_KEY);
const slackURL = process.env.SLACK_WEBHOOK_URL;
const contentfulSpaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const now = dayjs();

    const initialEmailDate = now.add(10, "days");
    const initialShowsToEmail = await getUpcomingShowsByDate(
      initialEmailDate,
      true
    );
    await sendEmails(initialShowsToEmail, "initial");

    const followUpEmailDate = now.add(4, "days");
    const followUpShows = await getUpcomingShowsByDate(followUpEmailDate, true);
    await sendEmails(followUpShows, "follow-up");

    const finalCallEmailDate = now.add(3, "days");
    const finalCallShows = await getUpcomingShowsByDate(
      finalCallEmailDate,
      true
    );
    await sendEmails(finalCallShows, "late");
    return res.status(200).end();
  } catch (error) {
    return res.status(400).send(error);
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

async function sendEmails(
  shows: ShowInterface[],
  severity: "initial" | "follow-up" | "late"
) {
  await Promise.all(
    shows.map(async (show) => {
      let showEmailed = false;
      await Promise.all(
        show.artistsCollection.items.map(async (artist) => {
          if (artist.email) {
            try {
              const data = await resend.sendEmail({
                from: "Refuge Worldwide <noreply@mail.refugeworldwide.com>",
                to: artist.email,
                subject: subject(severity),
                reply_to: "hello@refugeworldwide.com",
                react: ShowSubmissionEmail({
                  userName: artist.name,
                  showDateStart: show.date,
                  showDateEnd: show.dateEnd,
                  showType: show.type,
                  severity: severity,
                  showId: show.sys.id,
                }),
              });
              showEmailed = true;
            } catch (err) {
              // send message to slack saying there was an issue sending the email
              console.log(err);
              sendSlackMessage(
                `Failed to send email request to ${artist.name}(${artist.email}) on show *${show.title}*. ${err}. <@U04HG3VHHEW>`
              );
            }
          } else {
            // send message to slack saying artist does not have email address assigned to them.
            console.log(artist.name + " does not have email");
            sendSlackMessage(
              `*${artist.name}* has no email assigned to them. <https://app.contentful.com/spaces/${contentfulSpaceId}/entries/${artist.sys.id}|Add email >`
            );
          }
        })
      );
      if (!showEmailed) {
        sendSlackMessage(
          `Show *${show.title}* has no emails assigned. <https://app.contentful.com/spaces/${contentfulSpaceId}/entries/${show.sys.id}|Edit show >`
        );
      }
    })
  );
}
