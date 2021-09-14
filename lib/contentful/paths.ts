import dayjs from "dayjs";
import { graphql } from ".";
import { extractCollection } from "../../util";

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

export async function getSitemapPaths() {
  const data = await graphql(/* GraphQL */ `
    query SitemapPathsQuery {
      shows: showCollection(limit: 4000) {
        items {
          slug
        }
      }
      artists: artistCollection(limit: 4000) {
        items {
          slug
        }
      }
      articles: articleCollection(limit: 1000) {
        items {
          slug
        }
      }
    }
  `);

  return {
    shows: extractCollection<{ slug: string }>(data, "shows"),
    articles: extractCollection<{ slug: string }>(data, "articles"),
    artists: extractCollection<{ slug: string }>(data, "artists"),
  };
}
