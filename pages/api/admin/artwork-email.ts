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
  switch (req.method) {
    case "POST":
      try {
        const date = dayjs(values.date, "YYYY-MM-DD");
        console.log(date);
        const shows = await getUpcomingShowsByDate(date, true);
        console.log(shows);
        await Promise.all(
          shows.map(async (show) => {
            let showEmailed = false;
            await Promise.all(
              show.artistsCollection.items.map(async (artist) => {
                if (artist.email) {
                  try {
                    await sendArtworkEmail(artist, date);
                    showEmailed = true;
                  } catch (error) {
                    // send message to slack saying there was an issue sending the email
                    console.log(error);
                    sendSlackMessage(
                      `Failed to send email request to ${artist.name}(${artist.email}) on show *${show.title}*. ${error}. <@U04HG3VHHEW>`
                    );
                  }
                }
              })
            );
            if (!showEmailed) {
              sendSlackMessage(
                `Show *${show.title}* has no emails assigned. They did not recieve artwork email. <https://app.contentful.com/spaces/${contentfulSpaceId}/entries/${show.sys.id}|Edit show >`
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
}
