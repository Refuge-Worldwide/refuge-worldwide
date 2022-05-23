import * as Contentful from "contentful";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { TypeGenre, TypeShowFields } from "../../../types/contentful";

const contentful = Contentful.createClient({
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.CF_WEBHOOK_SECRET !== req.headers["webhook_secret"]) {
    return res.status(401).json({ message: "Invalid Secret" });
  }

  try {
    const body = JSON.parse(req.body);

    const show = await contentful.getEntry<TypeShowFields>(body.sys.id);

    const upsertGenres = (show.fields.genres as TypeGenre[]).map((genre) =>
      prisma.genre.upsert({
        where: { id: genre.sys.id },
        create: { id: genre.sys.id, name: genre.fields.name },
        update: { id: genre.sys.id, name: genre.fields.name },
      })
    );

    const upsertShow = prisma.show.upsert({
      create: {
        id: show.sys.id,
        title: show.fields.title,
        date: new Date(show.fields.date),
        slug: show.fields.slug,
        mixcloudLink: show.fields.mixcloudLink,
        coverImage: (show.fields.coverImage as Contentful.Asset).fields.file
          .url,
        genres: {
          connect: (show.fields.genres as TypeGenre[]).map((genre) => ({
            id: genre.sys.id,
          })),
        },
      },
      update: {
        id: show.sys.id,
        title: show.fields.title,
        date: new Date(show.fields.date),
        slug: show.fields.slug,
        mixcloudLink: show.fields.mixcloudLink,
        coverImage: (show.fields.coverImage as Contentful.Asset).fields.file
          .url,
        genres: {
          connect: (show.fields.genres as TypeGenre[]).map((genre) => ({
            id: genre.sys.id,
          })),
        },
      },
      where: {
        id: show.sys.id,
      },
    });

    const transactions = await prisma.$transaction([
      ...upsertGenres,
      upsertShow,
    ]);

    return res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).send("Error Syncing");
  }
}
