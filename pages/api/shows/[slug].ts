import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";
import { getRadioPageSingle } from "../../../lib/contentful/pages/radio";
import { ShowInterface, PastShowSchema } from "../../../types/shared";

export type ShowResponse = {
  show: ShowInterface & {
    description: string;
    audioFile: string | null;
    artists: Array<{
      name: string;
      slug: string;
      photo: string;
    }>;
  };
  relatedShows: PastShowSchema[];
};

export function processShowData(
  show: ShowInterface,
  relatedShows: PastShowSchema[]
): ShowResponse {
  const artists = show.artistsCollection.items.map((artist) => ({
    name: artist.name,
    slug: artist.slug,
    photo: artist.photo?.url || "",
  }));

  const processedShow = {
    ...show,
    description: show.content
      ? documentToPlainTextString(show.content.json)
      : "",
    audioFile: (show as any).audioFile?.url || null,
    artists,
  };

  return { show: processedShow, relatedShows };
}

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

    const { show, relatedShows } = await getRadioPageSingle(slug, false);

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

    if (error.message.includes("No Show found for slug")) {
      return res.status(404).json({ message: "Show not found" });
    }

    res.status(500).json({ message: error.message });
  }
}
