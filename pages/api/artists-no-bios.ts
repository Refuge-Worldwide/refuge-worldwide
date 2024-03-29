import type { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getArtistsWithoutBios } from "../../lib/contentful/search";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data } = await getArtistsWithoutBios();

    res
      .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
      .json(data);
  } catch (error) {
    assertError(error);

    res.status(400).json({
      message: error.message,
    });
  }
}
