import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";
import { getPastShows } from "../../lib/contentful/client";
import { PastShowSchema } from "../../types/shared";

export type ShowsResponse = (PastShowSchema & {
  audioFile: string | null;
})[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ShowsResponse | { message: string }>
) {
  try {
    const { take, skip, filter } = req.query as typeof req.query & {
      take: string;
      skip: string;
      filter: string;
    };

    // Parse filter from comma-separated string to array
    const filterArray = filter ? filter.split(",").filter(Boolean) : [];

    const shows = await getPastShows(
      Number(take),
      Number(parseInt(skip)),
      filterArray
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
