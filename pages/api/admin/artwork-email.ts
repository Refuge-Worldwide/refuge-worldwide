import { NextApiRequest, NextApiResponse } from "next";
import { sendArtworkEmail } from "../../../lib/resend/email";
import { getUpcomingShowsByDate } from "../../../lib/contentful/pages/radio";
import dayjs from "dayjs";
import { sendSlackMessage } from "../../../lib/slack";

const contentfulSpaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const rateLimitDelay = 105; // 105 milliseconds delay to respect rate limits

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const values = req.body;

  try {
    const date = dayjs(values.date, "YYYY-MM-DD");
    console.log(`Processing emails for date: ${date.format("YYYY-MM-DD")}`);

    const shows = await getUpcomingShowsByDate(date, true, "Submitted");
    console.log(`Found ${shows.length} shows to process`);

    const emailedArtists = new Set(); // Set to track emailed artist emails

    for (const show of shows) {
      let showEmailed = false;

      for (const artist of show.artistsCollection.items) {
        if (artist.email && !emailedArtists.has(artist.email)) {
          try {
            await sendArtworkEmail(artist, date);
            emailedArtists.add(artist.email); // Add artist email to the set after emailing
            showEmailed = true;
            await new Promise((resolve) => setTimeout(resolve, rateLimitDelay)); // Respect the rate limit
          } catch (error) {
            console.error(
              `Failed to send email to ${artist.name} (${artist.email}) for show "${show.title}":`,
              error
            );
            await sendSlackMessage(
              `Failed to send email request to ${artist.name} (${artist.email}) for show *${show.title}*. Error: ${error.message}. <@U04HG3VHHEW>`,
              "error"
            );
          }
        }
      }

      if (!showEmailed) {
        await sendSlackMessage(
          `Show *${show.title}* has no emails assigned. No artwork email was sent. <https://app.contentful.com/spaces/${contentfulSpaceId}/entries/${show.sys.id}|Edit show >`
        );
      }
    }

    return res.status(200).json("Artwork emails sent successfully");
  } catch (error) {
    console.error("Error processing emails:", error);
    return res.status(400).json({ message: error.message });
  }
}
