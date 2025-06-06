import { NextApiRequest, NextApiResponse } from "next";
import { sendArtworkEmail } from "../../../lib/resend/email";
import { getUpcomingShowsByDate } from "../../../lib/contentful/pages/radio";
import dayjs from "dayjs";
import { sendSlackMessage } from "../../../lib/slack";
import { RESEND_RATE_LIMIT_DELAY } from "../../../constants";

const CONTENTFUL_SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;

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
    // normally we send artwork out 2 days in advance so set this as default
    let daysToAdd = 2;

    console.log(req.query);

    // Check if we are processing artwork emails for tuesday.
    // These are sent on monday due to not being ready until then.
    if (req.query["for-tues"]) {
      daysToAdd = 1;
    }

    const now = dayjs();

    const artworkEmailDate = now.add(daysToAdd, "days");

    console.log(
      `Processing emails for date: ${artworkEmailDate.format("YYYY-MM-DD")}`
    );

    const shows = await getUpcomingShowsByDate(
      artworkEmailDate,
      false,
      "Submitted"
    );
    console.log(`Found ${shows.length} shows to process`);

    const emailedArtists = new Set(); // Set to track emailed artist emails

    for (const show of shows) {
      let showEmailed = false;
      let artwork = show.artwork.url + "?fm=jpg";

      for (const artist of show.artistsCollection.items) {
        if (artist.email && !emailedArtists.has(artist.email)) {
          try {
            await sendArtworkEmail(artist, artworkEmailDate, artwork);
            emailedArtists.add(artist.email); // Add artist email to the set after emailing
            showEmailed = true;
            await new Promise((resolve) =>
              setTimeout(resolve, RESEND_RATE_LIMIT_DELAY)
            ); // Respect the rate limit
          } catch (error) {
            console.error(
              `Failed to send email to ${artist.name} (${artist.email}) for show "${show.title}":`,
              error
            );
            await sendSlackMessage(
              `(◎-◎；) Failed to send email request to ${artist.name} (${artist.email}) for show *${show.title}*. Error: ${error.message}. <@U04HG3VHHEW>`,
              "error"
            );
          }
        }
      }

      if (!showEmailed) {
        await sendSlackMessage(
          `【・_・?】Show *${show.title}* has no emails assigned. No artwork email was sent. <https://app.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries/${show.sys.id}|Edit show >`
        );
      }
    }

    return res.status(200).json("Artwork emails sent successfully");
  } catch (error) {
    console.error("Error processing emails:", error);
    return res.status(400).json({ message: error.message });
  }
}
