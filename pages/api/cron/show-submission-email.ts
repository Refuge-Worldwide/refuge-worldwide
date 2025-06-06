import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import dayjs from "dayjs";
import { getUpcomingShowsByDate } from "../../../lib/contentful/pages/radio";
import { ShowInterface } from "../../../types/shared";
import { sendSlackMessage } from "../../../lib/slack";
import { sendEmail } from "../../../lib/resend/email";
import { RESEND_RATE_LIMIT_DELAY } from "../../../constants";

const contentfulSpaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ success: false });
  }

  try {
    const now = dayjs();

    const emailCheckDate = now.add(13, "days");
    const showsEmailCheck = await getUpcomingShowsByDate(emailCheckDate, true);
    checkEmails(showsEmailCheck);

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
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(400).send(error);
  }
}

async function sendEmails(
  shows: ShowInterface[],
  severity: "initial" | "follow-up" | "late"
) {
  for (const show of shows) {
    let showEmailed = false;

    for (const artist of show.artistsCollection.items) {
      if (artist.email) {
        await sendEmail(artist, show, severity);
        showEmailed = true;
        await new Promise((resolve) =>
          setTimeout(resolve, RESEND_RATE_LIMIT_DELAY)
        ); // Respect the rate limit
      }
    }

    if (!showEmailed) {
      await sendSlackMessage(
        `【・_・?】 Show *${show.title}* has no emails assigned. They did not receive ${severity} email. <https://app.contentful.com/spaces/${contentfulSpaceId}/entries/${show.sys.id}|Edit show >`
      );
    }
  }
}

function checkEmails(shows: ShowInterface[]) {
  shows.forEach((show) => {
    show.artistsCollection.items.forEach((artist) => {
      if (!artist.email) {
        sendSlackMessage(
          `【・_・?】 *${artist.name}* has no email assigned to them. This is a preflight check, please add an email address within 3 days to ensure they recieve the first automated email. <https://app.contentful.com/spaces/${contentfulSpaceId}/entries/${artist.sys.id}|Add email >`
        );
      }
    });
  });
}
