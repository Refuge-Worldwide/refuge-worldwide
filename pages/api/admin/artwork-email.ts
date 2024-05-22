import { NextApiRequest, NextApiResponse } from "next";
import { sendArtworkEmail } from "../../../lib/resend/email";
import { getUpcomingShowsByDate } from "../../../lib/contentful/pages/radio";
import dayjs from "dayjs";
import { sendSlackMessage } from "../../../lib/slack";
const contentfulSpaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const values = req.body;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const date = dayjs(values.date, "YYYY-MM-DD");
    console.log(date);

    const shows = await getUpcomingShowsByDate(date, true, "Submitted");
    console.log(shows);

    const rateLimit = 10;
    const delay = 1000 / rateLimit; // 100 milliseconds delay
    const emailedArtists = new Set(); // Set to track emailed artist emails

    await Promise.all(
      shows.map(async (show) => {
        let showEmailed = false;

        for (const artist of show.artistsCollection.items) {
          if (artist.email && !emailedArtists.has(artist.email)) {
            try {
              await sendArtworkEmail(artist, date);
              emailedArtists.add(artist.email); // Add artist email to the set after emailing
              showEmailed = true;
              await new Promise((resolve) => setTimeout(resolve, delay)); // Respect the rate limit
            } catch (error) {
              console.log(error);
              await sendSlackMessage(
                `Failed to send email request to ${artist.name} (${artist.email}) on show *${show.title}*. ${error}. <@U04HG3VHHEW>`
              );
            }
          } else if (!artist.email) {
            console.log(`${artist.name} does not have an email`);
            await sendSlackMessage(
              `*${artist.name}* has no email assigned to them. <https://app.contentful.com/spaces/${contentfulSpaceId}/entries/${artist.sys.id}|Add email >`
            );
          }
        }

        if (!showEmailed) {
          await sendSlackMessage(
            `Show *${show.title}* has no emails assigned. They did not receive artwork email. <https://app.contentful.com/spaces/${contentfulSpaceId}/entries/${show.sys.id}|Edit show >`
          );
        }
      })
    );

    return res.status(200).json("Artwork email sent");
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
}
