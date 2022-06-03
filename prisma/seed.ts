import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { getAllEntries } from "../lib/contentful/client";
import prisma from "../lib/prisma";
import {
  TypeArticleFields,
  TypeArtistFields,
  TypeGenre,
  TypeGenreFields,
  TypeShow,
  TypeShowFields,
} from "../types/contentful";

const createGenreSchema = (genre: TypeGenre): Prisma.GenreCreateInput => ({
  id: genre.sys.id,
  name: genre.fields.name,
});

const createShowSchema = (show: TypeShow): Prisma.ShowCreateInput => ({
  id: show.sys.id,
  title: show.fields.title,
  date: new Date(show.fields.date),
  coverImage: show.fields.coverImage.fields.file.url,
  mixcloudLink: show.fields.mixcloudLink,
  slug: show.fields.slug,
  genres: {
    connect: show.fields.genres.map((genre) => ({
      id: genre.sys.id,
    })),
  },
});

async function main() {
  const allGenres = await getAllEntries<TypeGenreFields>("genre", 100);
  const allShows = await getAllEntries<TypeShowFields>("show", 500, {
    "fields.mixcloudLink[exists]": true,
    "fields.date[lte]": dayjs().format("YYYY-MM-DD"),
  });
  const allArticles = await getAllEntries<TypeArticleFields>("show", 100);
  const allArtists = await getAllEntries<TypeArtistFields>("artist", 100);

  const genreUpserts = allGenres.map(async (genre) =>
    prisma.genre.upsert({
      create: createGenreSchema(genre),
      update: createGenreSchema(genre),
      where: {
        id: genre.sys.id,
      },
    })
  );

  const showUpserts = allShows.map(async (show) =>
    prisma.show.upsert({
      create: createShowSchema(show),
      update: createShowSchema(show),
      where: {
        slug: show.fields.slug,
      },
    })
  );

  for await (const upsert of [...genreUpserts, ...showUpserts]) {
    console.log(upsert);
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
