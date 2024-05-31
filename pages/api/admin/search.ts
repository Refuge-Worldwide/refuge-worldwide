import type { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getArtistSearchData } from "../../../lib/contentful/search";
import { searchCalendarShows } from "../../../lib/contentful/calendar";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { query, type } = req.query as typeof req.query & {
      query: string;
      type?: string;
    };

    let items = [];

    if (type == "artists") {
      const artists = await getArtistSearchData(query, 20, true);
      items = artists.items;
    } else {
      const shows = await searchCalendarShows(query, true);
      items = shows.items;
    }

    res
      .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
      .json(items);
  } catch (error) {
    assertError(error);

    res.status(400).json({
      message: error.message,
    });
  }
}
