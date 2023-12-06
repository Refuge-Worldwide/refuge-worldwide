import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import ShowSubmissionEmail from "../../emails/showSubmission";
import dayjs from "dayjs";
import { getUpcomingShowsByDate } from "../../lib/contentful/pages/radio";
import { ShowInterface } from "../../types/shared";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET": {
      const now = dayjs();

      const initialEmailDate = now.add(10, "days");
      const initialShowsToEmail = await getUpcomingShowsByDate(true);
      console.log(initialShowsToEmail);
      await sendEmails(initialShowsToEmail, "initial");

      // const followUpEmailDate = now.add(4, "days");
      // const followUpShows = await getUpcomingShowsByDate(
      //   followUpEmailDate,
      //   true
      // );
      // await sendEmails(followUpShows, 'follow-up')

      // const finalCallEmailDate = now.add(3, "days");
      // const finalCallShows = await getUpcomingShowsByDate(
      //   finalCallEmailDate,
      //   true
      // );
      // await sendEmails(finalCallShows, 'late')
    }
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

function subject(severity: string) {
  if (severity == "initial") {
    return "Upcoming show - info required";
  } else if (severity == "follow-up") {
    return "Final call for info!";
  } else {
    return "Your submission is late!";
  }
}

async function sendEmails(
  shows: ShowInterface[],
  severity: "initial" | "follow-up" | "late"
) {
  await Promise.all(
    shows.map(async (show) => {
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
            } catch (err) {
              // send message to slack saying there was an issue sending the email
              // https://dev.to/hrishikeshps/send-slack-notifications-via-nodejs-3ddn
              console.log(err);
            }
          } else {
            // send message to slack saying artist does not have email address assigned to them.
            console.log(artist.name + " does not have email");
          }
        })
      );
    })
  );
}
