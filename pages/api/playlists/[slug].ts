import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getPlaylistBySlug } from "../../../lib/contentful/pages/playlists";
import { PlaylistSchema } from "../../../types/shared";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PlaylistSchema | { message: string }>
) {
  try {
    const { slug } = req.query as typeof req.query & {
      slug: string;
    };

    const playlist = await getPlaylistBySlug(slug, false);

    res
      .setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
      .json(playlist);
  } catch (error) {
    assertError(error);

    console.log(error);

    res.status(404).json({ message: error.message });
  }
}
