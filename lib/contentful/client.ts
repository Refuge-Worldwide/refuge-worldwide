import { createClient, EntriesQueries, Entry } from "contentful";
import { graphql } from ".";
import { extractLinkedFromCollection, extractCollection } from "../../util";
import { ShowPreviewFragment } from "./fragments";
import dayjs from "dayjs";
import type { TypeShow, TypeShowFields } from "../../types/contentful";
import type { ShowInterface, PastShowSchema } from "../../types/shared";
import { sort, placeholderImage } from "../../util";

export const client = createClient({
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
});

export const previewClient = createClient({
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN,
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  host: "preview.contentful.com",
});

export const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
});

export const getClient = (preview?: boolean) =>
  preview ? previewClient : client;

export async function getAllEntries<Fields>(
  contentType: "genre" | "show" | "article" | "artist",
  perPage: number,
  options: EntriesQueries<Fields> = {}
) {
  const { total } = await client.getEntries<Fields>({
    content_type: contentType,
    limit: 1,
  });

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

export const createPastShowSchema = (show: TypeShow): PastShowSchema => ({
  id: show.sys.id,
  title: show.fields.title,
  date: show.fields.date,
  slug: show.fields.slug,
  mixcloudLink: show.fields.mixcloudLink,
  coverImage: show.fields.coverImage
    ? show.fields.coverImage.fields.file.url
    : placeholderImage.url,
  genres: show.fields.genres.map((genre) => genre.fields?.name).filter(Boolean),
  // TODO: check if this field can be removed.
  artwork: show.fields.artwork ? show.fields.artwork.fields.file.url : null,
  audioFile: (show.fields as any).audioFile?.fields?.file?.url || null,
});

export async function getPastShows(
  take: number,
  skip: number,
  filter: string[]
) {
  const now = dayjs().format("YYYY-MM-DD");

  if (filter.length == 0) {
    const { items } = await client.getEntries<TypeShowFields>({
      "fields.mixcloudLink[exists]": true,
      "fields.coverImage[exists]": true,
      "fields.date[lte]": now,
      order: "-fields.date,fields.title",
      content_type: "show",
      limit: take,
      skip: skip,
    });

    const processed = (items as Entry<TypeShowFields>[]).map(
      createPastShowSchema
    );

    return processed;
  }

  const genreShowQuery = /* GraphQL */ `
    query genreShowQuery($filter: String) {
      genreCollection(where: { name: $filter }, limit: 1) {
        items {
          linkedFrom {
            showCollection(limit: 200) {
              items {
                coverImage {
                  sys {
                    id
                  }
                  title
                  description
                  url
                  width
                  height
                }
                date
                genresCollection(limit: 9) {
                  items {
                    name
                  }
                }
                mixcloudLink
                slug
                title
                audioFile {
                  url
                }
                sys {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await graphql(genreShowQuery, {
    variables: { filter },
  });

  const items =
    res.data.genreCollection.items[0].linkedFrom.showCollection.items;

  items.forEach((show) => {
    if (!show.coverImage || !show.coverImage.url) {
      console.log("Show without cover image URL:", show);
    }
  });

  //TODO: move to processor function.
  const processed = items.map((show) => ({
    id: show.sys.id,
    title: show.title,
    date: show.date,
    slug: show.slug,
    mixcloudLink: show.mixcloudLink,
    coverImage: show.coverImage?.url
      ? show.coverImage.url
      : placeholderImage.url,
    genres: show.genresCollection.items
      .map((genre) => genre?.name)
      .filter(Boolean),
  }));

  // remove shows that do not have a playback link or are newer than today.
  const filtered = processed.filter(
    (show) => show.mixcloudLink && show.date <= now
  );

  // sort shows by date
  const sorted = filtered.sort((a, b) => {
    if (dayjs(a.date).isAfter(b.date)) return -1;
    if (dayjs(b.date).isAfter(a.date)) return 1;
    return sort.alpha(a.title, b.title);
  });

  // paginate and return
  return sorted.slice(skip, skip + take);
}

export async function getShowByTime(time) {
  console.log(time);
  const { items } = await previewClient.getEntries<TypeShowFields>({
    "fields.date[lte]": time,
    "fields.dateEnd[gte]": time,
    content_type: "show",
    limit: 1,
  });

  const processed = (items as Entry<TypeShowFields>[]).map(
    createPastShowSchema
  );

  return processed;
}
