import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getCalendarShows } from "../../lib/contentful/calendar";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { start, end } = req.query as typeof req.query & {
      start: string;
      end: string;
    };

    const shows = await getCalendarShows(false, start, end);

    res
      .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
      .json(shows);
  } catch (error) {
    assertError(error);

    console.log(error);

    res.status(400).json({ message: error.message });
  }
}
