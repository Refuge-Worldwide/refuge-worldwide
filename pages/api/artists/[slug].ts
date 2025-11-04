import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";
import { getArtistsPageSingle } from "../../../lib/contentful/pages/artists";
import { ArtistEntry, PastShowSchema } from "../../../types/shared";

export type ArtistResponse = Omit<ArtistEntry, "content" | "linkedFrom"> & {
  description: string;
  shows: PastShowSchema[];
};

export function processArtistData(
  artist: ArtistEntry,
  shows: PastShowSchema[]
): ArtistResponse {
  const { content, linkedFrom, ...artistWithoutContent } = artist;

  return {
    ...artistWithoutContent,
    description: content ? documentToPlainTextString(content.json) : "",
    shows,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ArtistResponse | { message: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ message: "Artist slug is required" });
    }

    const { artist, relatedShows: shows } = await getArtistsPageSingle(
      slug,
      false
    );

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    const response = processArtistData(artist, shows);

    res
      .setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
      .json(response);
  } catch (error) {
    assertError(error);

    console.log(error);

    if (error.message.includes("No Artist found for slug")) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.status(500).json({ message: error.message });
  }
}
