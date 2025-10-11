import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getAllGenres } from "../../lib/contentful/pages/radio";

export type GenresResponse = string[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenresResponse | { message: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const genres = await getAllGenres();
    const genreNames = genres.map((genre) => genre.name);

    res
      .setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200")
      .json(genreNames);
  } catch (error) {
    assertError(error);

    console.log(error);

    res.status(500).json({ message: error.message });
  }
}
