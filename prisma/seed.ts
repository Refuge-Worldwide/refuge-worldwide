import type * as Contentful from "contentful";
import dayjs from "dayjs";
import { client } from "../lib/contentful/client";
import prisma from "../lib/prisma";
import {
  TypeGenre,
  TypeGenreFields,
  TypeShowFields,
} from "../types/contentful";
import { delay } from "../util";

async function getAllGenres(perPage = 100) {
  const { total } = await client.getEntries<TypeGenreFields>({
    content_type: "genre",
    limit: 1,
  });

  const allGenres = await Promise.all(
    [...Array(Math.round(total / perPage + 1))].map(async (_, index) => {
      const { items } = await client.getEntries<TypeGenreFields>({
        content_type: "genre",
        limit: perPage,
        skip: index * perPage,
      });

      return items;
    })
  );

  return allGenres.flat();
}

async function getAllShows(perPage = 100) {
  const { total } = await client.getEntries<TypeShowFields>({
    content_type: "show",
    limit: 1,
  });

  const allShows = await Promise.all(
    [...Array(Math.round(total / perPage + 1))].map(async (_, index) => {
      const { items } = await client.getEntries<TypeShowFields>({
        content_type: "show",
        limit: perPage,
        skip: index * perPage,
        "fields.mixcloudLink[exists]": true,
        "fields.date[lte]": dayjs().format("YYYY-MM-DD"),
      });

      return items;
    })
  );

  return allShows.flat();
}

async function main() {
  const allGenresContentful = await getAllGenres();
  const allShowsContentful = await getAllShows();

  const genreUpserts = allGenresContentful.map(async (genre) =>
    prisma.genre.upsert({
      create: {
        id: genre.sys.id,
        name: genre.fields.name,
      },
      update: {
        id: genre.sys.id,
        name: genre.fields.name,
      },
      where: {
        id: genre.sys.id,
      },
    })
  );

  const showUpserts = allShowsContentful.map(async (show) =>
    prisma.show.upsert({
      create: {
        id: show.sys.id,
        title: show.fields.title,
        date: new Date(show.fields.date),
        coverImage: (show.fields.coverImage as Contentful.Asset).fields.file
          .url,
        mixcloudLink: show.fields.mixcloudLink,
        slug: show.fields.slug,
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
        coverImage: (show.fields.coverImage as Contentful.Asset).fields.file
          .url,
        mixcloudLink: show.fields.mixcloudLink,
        slug: show.fields.slug,
        genres: {
          connect: (show.fields.genres as TypeGenre[]).map((genre) => ({
            id: genre.sys.id,
          })),
        },
      },
      where: {
        slug: show.fields.slug,
      },
    })
  );

  for await (const upsert of [...genreUpserts, ...showUpserts]) {
    console.log(upsert);

    await delay(2000);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
