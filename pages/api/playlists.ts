import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getPlaylists } from "../../lib/contentful/pages/playlists";
import { PlaylistListItem } from "../../types/shared";

export type PlaylistsResponse = PlaylistListItem[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PlaylistsResponse | { message: string }>
) {
  try {
    const { take, skip } = req.query as typeof req.query & {
      take: string;
      skip: string;
    };

    const playlists = await getPlaylists(
      take ? Number(take) : 20,
      skip ? Number(parseInt(skip)) : 0
    );

    res
      .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
      .json(playlists);
  } catch (error) {
    assertError(error);

    console.log(error);

    res.status(400).json({ message: error.message });
  }
}
