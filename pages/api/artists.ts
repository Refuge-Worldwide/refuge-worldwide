import { NextApiRequest, NextApiResponse } from "next";
import { getArtistsPage } from "../../lib/contentful/pages/artists";
import { AllArtistEntry } from "../../types/shared";
import { assertError } from "ts-extras";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AllArtistEntry[] | { message: string }>
) {
  try {
    const { role, limit, skip } = req.query as typeof req.query & {
      role: string;
      limit: string;
      skip: string;
    };

    const roleBoolean = role.toLowerCase() === "true";

    const artists = await getArtistsPage(
      roleBoolean,
      Number(limit),
      Number(skip)
    );
    res.status(200).json(artists);
  } catch (error) {
    assertError(error);

    console.log(error);

    res.status(400).json({ message: error.message });
  }
}
