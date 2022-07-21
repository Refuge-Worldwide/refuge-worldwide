import dayjs from "dayjs";
import { getAllEntries } from "../lib/contentful/client";
import {
  TypeArticleFields,
  TypeArtistFields,
  TypeGenreFields,
  TypeShowFields,
} from "../types/contentful";

async function main() {
  const allGenres = await getAllEntries<TypeGenreFields>("genre", 100);
  const allShows = await getAllEntries<TypeShowFields>("show", 500, {
    "fields.mixcloudLink[exists]": true,
    "fields.date[lte]": dayjs().format("YYYY-MM-DD"),
  });
  const allArticles = await getAllEntries<TypeArticleFields>("show", 100);
  const allArtists = await getAllEntries<TypeArtistFields>("artist", 100);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
