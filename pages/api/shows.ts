import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getPastShows, PastShowSchema } from "../../lib/contentful/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PastShowSchema[] | { message: string }>
) {
  try {
    const { take, skip, filter } = req.query as typeof req.query & {
      take: string;
      skip: string;
      filter: string;
    };

    const shows = await getPastShows(Number(take), Number(skip), filter);

    res
      .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate")
      .json(shows);
  } catch (error) {
    assertError(error);

    console.log(error);

    res.status(400).json({ message: error.message });
  }
}
