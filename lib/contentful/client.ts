import { createClient, EntriesQueries, Entry } from "contentful";
import { graphql } from ".";
import { extractLinkedFromCollection, extractCollection } from "../../util";
import { ShowPreviewFragment } from "./fragments";
import dayjs from "dayjs";
import type { TypeShow, TypeShowFields } from "../../types/contentful";
import type { ShowInterface } from "../../types/shared";
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
  filter: string[]
) {
  const now = dayjs().format("YYYY-MM-DD");

  if (filter.length == 0) {
    const { items } = await client.getEntries<TypeShowFields>({
      "fields.mixcloudLink[exists]": true,
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
    query genreShowQuery($filter: String, $take: Int, $skip: Int) {
      genreCollection(where: { name: $filter }, limit: 1) {
        items {
          linkedFrom {
            showCollection(limit: $take, skip: $skip) {
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
    variables: { filter, take, skip },
  });

  const items =
    res.data.genreCollection.items[0].linkedFrom.showCollection.items;

  const processed = items.map((show) => ({
    id: show.sys.id,
    title: show.title,
    date: show.date,
    slug: show.slug,
    mixcloudLink: show.mixcloudLink,
    coverImage: show.coverImage.url,
    genres: show.genresCollection.items.map((genre) => genre.name),
  }));

  return processed;
}
