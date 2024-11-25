// This API endpoint returns a show that takes place at a specific time.
// Used to link recordings to shows in automated uploading process.

import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getShowByTime } from "../../lib/contentful/client";
import { PastShowSchema } from "../../types/shared";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PastShowSchema[] | { message: string }>
) {
  try {
    const { time } = req.query as typeof req.query & {
      time: string;
    };

    const show = await getShowByTime(time);

    res
      .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
      .json(show);
  } catch (error) {
    assertError(error);

    console.log(error);

    res.status(400).json({ message: error.message });
  }
}
