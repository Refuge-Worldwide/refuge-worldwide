import dayjs from "dayjs";
import type {
  TypeArticle,
  TypeArticleFields,
  TypeArtist,
  TypeArtistFields,
  TypeShow,
  TypeShowFields,
} from "../../types/contentful";
import { client } from "./client";
import { previewClient } from "./client";
export interface SearchData {
  shows: TypeShow[];
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
          "fields.title",
          "fields.slug",
          "fields.date",
          "fields.artists",
          "fields.genres",
          "fields.coverImage",
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

  const { items: shows } = showsCollection;
  const { items: articles } = articlesCollection;
  const { items: artists } = artistsCollection;

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
  includeEmail?: boolean
) {
  const start = Date.now();

  const [artistsCollection] = await Promise.all([
    previewClient.getEntries<TypeArtistFields>({
      content_type: "artist",
      limit: limit,
      order: "fields.name",

      "fields.name[match]": query,

      select: ["fields.name", "fields.email", "fields.content", "fields.photo"],
    }),
  ]);

  const end = Date.now();

  const items = artistsCollection.items.map((artist) => {
    return {
      label: artist.fields.name,
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

export async function getArtistsWithoutBios() {
  const [artistsCollection] = await Promise.all([
    previewClient.getEntries<TypeArtistFields>({
      content_type: "artist",
      order: "fields.name",
      "fields.content[exists]": false,
      "fields.email[exists]": true,

      select: ["fields.name", "fields.email", "fields.content"],
    }),
  ]);

  const { items: artists } = artistsCollection;

  return {
    data: artists,
  };
}
