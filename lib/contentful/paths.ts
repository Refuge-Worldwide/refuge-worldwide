import dayjs from "dayjs";
import { graphql } from ".";
import {
  TypeArticleFields,
  TypeArtistFields,
  TypeShowFields,
} from "../../types/contentful";
import { extractCollection } from "../../util";
import { getAllEntries } from "./client";

export async function getArtistPathsToPreRender() {
  const data = await graphql(/* GraphQL */ `
    query ArtistPathsToPreRenderQuery {
      artistCollection(
        where: { slug_exists: true }
        limit: 100
        order: name_ASC
      ) {
        items {
          slug
        }
      }
    }
  `);

  const collection = extractCollection<{ slug: string }>(
    data,
    "artistCollection"
  );

  const paths = collection.map((el) => ({
    params: { slug: el.slug },
  }));

  return paths;
}

export async function getArticlePathsToPreRender() {
  const data = await graphql(/* GraphQL */ `
    query ArticlePathsToPreRenderQuery {
      articleCollection(
        where: { slug_exists: true }
        limit: 50
        order: date_DESC
      ) {
        items {
          slug
        }
      }
    }
  `);

  const collection = extractCollection<{ slug: string }>(
    data,
    "articleCollection"
  );

  const paths = collection.map((el) => ({
    params: { slug: el.slug },
  }));

  return paths;
}

export async function getShowPathsToPreRender() {
  const today = dayjs().format("YYYY-MM-DD");

  const ShowPathsToPreRenderQuery = /* GraphQL */ `
    query ShowPathsToPreRenderQuery($today: DateTime) {
      showCollection(
        where: { slug_exists: true, date_lt: $today }
        limit: 100
        order: date_DESC
      ) {
        items {
          slug
        }
      }
    }
  `;

  const data = await graphql(ShowPathsToPreRenderQuery, {
    variables: { today },
  });

  const collection = extractCollection<{ slug: string }>(
    data,
    "showCollection"
  );

  const paths = collection.map((el) => ({
    params: { slug: el.slug },
  }));

  return paths;
}

const createSlug = (slug: string, base: "artists" | "radio" | "news") =>
  `https://refugeworldwide.com/${base}/${slug}`;

export async function getSitemapSlugs() {
  const allShows = await getAllEntries<TypeShowFields>("show", 1000);
  const allArticles = await getAllEntries<TypeArticleFields>("show", 100);
  const allArtists = await getAllEntries<TypeArtistFields>("artist", 100);

  return {
    shows: allShows
      .map((show) => ({ slug: show.fields.slug }))
      .map(({ slug }) => createSlug(slug, "radio")),

    artists: allArtists
      .map((artist) => ({ slug: artist.fields.slug }))
      .map(({ slug }) => createSlug(slug, "artists")),

    articles: allArticles
      .map((article) => ({ slug: article.fields.slug }))
      .map(({ slug }) => createSlug(slug, "news")),
  };
}
