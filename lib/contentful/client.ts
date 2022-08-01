import { createClient, EntriesQueries, Entry } from "contentful";
import dayjs from "dayjs";
import type { TypeShow, TypeShowFields } from "../../types/contentful";
import { sort } from "../../util";

export const client = createClient({
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
});

export const previewClient = createClient({
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN,
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  host: "preview.contentful.com",
});

export const getClient = (preview?: boolean) =>
  preview ? previewClient : client;

export async function getAllEntries<Fields>(
  contentType: "genre" | "show" | "article" | "artist",
  perPage: number,
  options: EntriesQueries<Fields> = {}
) {
  console.log(`cntfl - running 'getEntries' for '${contentType}'`);

  const { total } = await client.getEntries<Fields>({
    content_type: contentType,
    limit: 1,
  });

  console.log(`cntfl - '${contentType}' entries: ${total}`);

  const entries = await Promise.all(
    [...Array(Math.round(total / perPage + 1))].map(async (_, index) => {
      const { items } = await client.getEntries<Fields>({
        ...options,
        content_type: contentType,
        limit: perPage,
        skip: index * perPage,
      });

      return items;
    })
  );

  return entries.flat() as Entry<Fields>[];
}

export type PastShowSchema = {
  date: string;
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  mixcloudLink: string;
  genres: string[];
};

export const createPastShowSchema = (show: TypeShow): PastShowSchema => ({
  id: show.sys.id,
  title: show.fields.title,
  date: show.fields.date,
  slug: show.fields.slug,
  mixcloudLink: show.fields.mixcloudLink,
  coverImage: show.fields.coverImage.fields.file.url,
  genres: show.fields.genres.map((genre) => genre.fields.name),
});

export async function getPastShows(
  take: number,
  skip: number,
  filter: "All" | string
) {
  const allShows = await getAllEntries<TypeShowFields>("show", 1000, {
    "fields.mixcloudLink[exists]": true,
    "fields.date[lte]": dayjs().format("YYYY-MM-DD"),
  });

  const processed = allShows.map(createPastShowSchema);

  const filtered = processed.filter((show) => {
    if (filter === "All") return true;
    return show.genres.includes(filter);
  });

  const sorted = filtered.sort((a, b) => {
    if (dayjs(a.date).isAfter(b.date)) return -1;
    if (dayjs(b.date).isAfter(a.date)) return 1;
    return sort.alpha(a.title, b.title);
  });

  return sorted.slice(skip, skip + take);
}
