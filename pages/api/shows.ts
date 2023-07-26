import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getPastShows } from "../../lib/contentful/client";
import { PastShowSchema } from "../../types/shared";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PastShowSchema[] | { message: string }>
) {
  try {
    const { take, skip, filter } = req.query as typeof req.query & {
      take: string;
      skip: string;
      filter: string[];
    };

    const shows = await getPastShows(
      Number(take),
      Number(parseInt(skip)),
      filter
    );

    res
      .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
      .json(shows);
  } catch (error) {
    assertError(error);

    console.log(error);

    res.status(400).json({ message: error.message });
  }
}
