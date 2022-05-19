import { NextApiRequest, NextApiResponse } from "next";
import { getAllGenres, getPastShows } from "../../lib/contentful/pages/radio";
import prisma from "../../lib/prisma";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const pastShows = await getPastShows(false, 10, 0);

  const upsertPastShows = await Promise.all(
    pastShows.map(async (show) =>
      prisma.show.upsert({
        create: {
          id: show.sys.id,
          title: show.title,
          date: show.date,
          coverImage: show.coverImage.url,
          mixcloudLink: show.mixcloudLink,
          slug: show.slug,
          genres: {
            connect: show.genresCollection.items.map((genre) => ({
              id: genre.sys.id,
            })),
          },
        },
        update: {
          id: show.sys.id,
          title: show.title,
          date: show.date,
          coverImage: show.coverImage.url,
          mixcloudLink: show.mixcloudLink,
          slug: show.slug,
          genres: {
            connect: show.genresCollection.items.map((genre) => ({
              id: genre.sys.id,
            })),
          },
        },
        where: {
          slug: show.slug,
        },
      })
    )
  );

  res.status(200).json({ success: true, upsertPastShows });
}
