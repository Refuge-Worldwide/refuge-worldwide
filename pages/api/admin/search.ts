import type { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getCalendarSearchData } from "../../../lib/contentful/search";
import { searchCalendarShows } from "../../../lib/contentful/calendar";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { query } = req.query as typeof req.query & {
      query: string;
    };

    const shows = await searchCalendarShows(query, true);

    res
      .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
      .json(shows.processed);
  } catch (error) {
    assertError(error);

    res.status(400).json({
      message: error.message,
    });
  }
}
