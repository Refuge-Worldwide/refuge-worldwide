import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getRadioPageById } from "../../../../lib/contentful/pages/radio";
import { ShowResponse, processShowData } from "../[slug]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ShowResponse | { message: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Show ID is required" });
    }

    const { show, relatedShows } = await getRadioPageById(id, false);

    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    const response = processShowData(show, relatedShows);

    res
      .setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
      .json(response);
  } catch (error) {
    assertError(error);

    console.log(error);

    if (error.message.includes("No Show found for id")) {
      return res.status(404).json({ message: "Show not found" });
    }

    res.status(500).json({ message: error.message });
  }
}
