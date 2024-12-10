// This API endpoint returns a show that takes place at a specific time.
// Used to link recordings to shows in automated uploading process.

import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getShowByTime } from "../../../lib/contentful/client";
import { PastShowSchema } from "../../../types/shared";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PastShowSchema[] | { message: string }>
) {
  const authHeader = req.headers.authorization;

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.API_SECRET}`
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { t } = req.query as typeof req.query & {
      t: string;
    };

    const show = await getShowByTime(t);

    res
      .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
      .json(show);
  } catch (error) {
    assertError(error);

    console.log(error);

    res.status(400).json({ message: error.message });
  }
}
