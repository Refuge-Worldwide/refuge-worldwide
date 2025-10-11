import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getRadioPageSingle } from "../../../lib/contentful/pages/radio";
import { ShowInterface, PastShowSchema } from "../../../types/shared";

// Response type for individual show endpoint
export type ShowResponse = {
  show: ShowInterface;
  relatedShows: PastShowSchema[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ShowResponse | { message: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ message: "Show slug is required" });
    }

    // Use the existing function that gets show data for the show page
    const { show, relatedShows } = await getRadioPageSingle(slug, false);

    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    res
      .setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
      .json({ show, relatedShows });
  } catch (error) {
    assertError(error);

    console.log(error);

    // Handle specific "not found" errors
    if (error.message.includes("No Show found for slug")) {
      return res.status(404).json({ message: "Show not found" });
    }

    res.status(500).json({ message: error.message });
  }
}
