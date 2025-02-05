import dayjs from "dayjs";
import type {
  TypeArticle,
  TypeArticleFields,
  TypeArtist,
  TypeArtistFields,
  TypeShowFields,
} from "../../types/contentful";
import { client } from "./client";
import { previewClient } from "./client";
import { s } from "@fullcalendar/core/internal-common";
import { PastShowSchema } from "../../types/shared";
import { createPastShowSchema } from "./client";
import { placeholderImage } from "../../util";
export interface SearchData {
  shows: PastShowSchema[];
  articles: TypeArticle[];
  artists: TypeArtist[];
}

export async function getSearchData(
  query: string,
  limit = 20,
  noQueryLimit = 4
) {
  const start = Date.now();

  const [showsCollection, articlesCollection, artistsCollection] =
    await Promise.all([
      client.getEntries<TypeShowFields>({
        content_type: "show",
        limit: query ? limit : noQueryLimit,
        order: "-fields.date,fields.title",

        "fields.mixcloudLink[exists]": true,
        "fields.date[lte]": dayjs().format("YYYY-MM-DD"),

        query: query,

        select: [
          "sys.id",
          "fields.title",
          "fields.slug",
          "fields.date",
          "fields.artists",
          "fields.genres",
          "fields.coverImage",
          "fields.mixcloudLink",
        ],
      }),
      client.getEntries<TypeArticleFields>({
        content_type: "article",
        limit: query ? limit : noQueryLimit,
        order: "-fields.date",

        "fields.articleType[exists]": true,

        "fields.title[match]": query,

        select: [
          "fields.title",
          "fields.slug",
          "fields.date",
          "fields.coverImage",
          "fields.articleType",
        ],
      }),
      client.getEntries<TypeArtistFields>({
        content_type: "artist",
        limit: query ? limit : noQueryLimit,
        order: "fields.name",

        "fields.name[match]": query,

        select: ["fields.name", "fields.slug", "fields.photo"],
      }),
    ]);

  const end = Date.now();

  const shows = showsCollection.items.map(parseShowToPastShowSchema);
  const articles = articlesCollection.items;
  const artists = artistsCollection.items;

  return {
    data: { shows, articles, artists } as SearchData,
    duration: end - start,
  };
}

export async function getCalendarSearchData(query: string, limit = 100) {
  const start = Date.now();

  const [showsCollection] = await Promise.all([
    previewClient.getEntries<TypeShowFields>({
      content_type: "show",
      limit: limit,
      order: "-fields.date,fields.title",
      query: query,
      select: [
        "sys.id",
        "fields.title",
        "fields.slug",
        "fields.date",
        "fields.dateEnd",
        "fields.artists",
        "fields.genres",
        "fields.coverImage",
      ],
    }),
  ]);

  const end = Date.now();

  const { items: shows } = showsCollection;

  return {
    data: { shows },
    duration: end - start,
  };
}

export async function getArtistSearchData(
  query: string,
  limit = 20,
  includeEmail?: boolean,
  showStatus?: boolean
) {
  const start = Date.now();

  const [artistsCollection] = await Promise.all([
    previewClient.getEntries<TypeArtistFields>({
      content_type: "artist",
      limit: limit,
      order: "fields.name",

      "fields.name[match]": query,

      select: [
        "sys.revision",
        "fields.name",
        "fields.email",
        "fields.content",
        "fields.photo",
      ],
    }),
  ]);

  const end = Date.now();

  const items = artistsCollection.items.map((artist) => {
    let label = artist.fields.name;
    if (!artist.sys.revision && showStatus) {
      label += " (draft)";
    }
    return {
      label: label,
      value: artist.sys.id,
      content: artist.fields.content ? true : false,
      image: artist.fields.photo ? true : false,
      ...(includeEmail && { email: artist.fields.email }),
    };
  });

  return {
    items,
    duration: end - start,
  };
}

// TODO: move to shared function alongside shows page.
function parseShowToPastShowSchema(show): PastShowSchema {
  return {
    date: show.fields?.date,
    id: show.sys?.id,
    title: show.fields?.title,
    slug: show.fields?.slug,
    coverImage: show.fields.coverImage
      ? show.fields.coverImage.fields.file.url
      : placeholderImage.url,
    mixcloudLink: show.fields?.mixcloudLink,
    genres: show.fields.genres
      .map((genre) => genre.fields?.name)
      .filter(Boolean),
  };
}
