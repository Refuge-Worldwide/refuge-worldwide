import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getCalendarShows } from "../../lib/contentful/calendar";
import { createClient } from "contentful-management";
import {
  formatArtistsForContenful,
  createReferencesArray,
} from "../../lib/contentful/management";
import dayjs from "dayjs";

const accesstoken = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const client = createClient({
  accessToken: accesstoken,
});
const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID;
const showContentTypeId = "show";
const artistContentTypeId = "artist";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const values = req.body;
  console.log("REQUEST METHOD: " + req.method);
  switch (req.method) {
    case "GET":
      try {
        console.log(req.query);
        const { start, end } = req.query as typeof req.query & {
          start: string;
          end: string;
        };

        const shows = await getCalendarShows(start, end, true);

        res
          .status(200)
          .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
          .json(shows);
        break;
      } catch (error) {
        assertError(error);

        console.log(error);

        res.status(400).json({ message: error.message });
      }
  }
}
