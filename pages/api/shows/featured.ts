import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getHomePage } from "../../../lib/contentful/pages/home";
import { PastShowSchema } from "../../../types/shared";

export type FeaturedShowsResponse = PastShowSchema[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FeaturedShowsResponse | { message: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { featuredShows } = await getHomePage();

    res
      .setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
      .json(featuredShows);
  } catch (error) {
    assertError(error);

    console.log(error);

    res.status(500).json({ message: error.message });
  }
}
