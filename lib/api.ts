import type { Document } from "@contentful/rich-text-types";
import dayjs from "dayjs";
import type {
  ArticleInterface,
  ArtistInterface,
  CoverImage,
  GenreInterface,
  ShowInterface,
} from "../types/shared";
import { extractCollection, extractCollectionItem, extractPage } from "../util";
import { ENDPOINT } from "./constants";

export async function contentful(query: string, preview = false) {
  return fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${
        preview
          ? process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN
          : process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
      }`,
    },
    body: JSON.stringify({ query }),
  }).then((response) => response.json());
}

export interface AboutPageData {
  coverImage: CoverImage;
  content: { json: Document };
}

export async function getAboutPage(preview: boolean): Promise<AboutPageData> {
  const data = await contentful(
    /* GraphQL */ `
    query {
      pageAbout(id: "z1SsoA1K4SMJryGuYjzhK", preview: ${preview}) {
        coverImage {
          title
          description
          url
          width
          height
        }
        content {
          json
        }
      }
    }
  `,
    preview
  );

  return extractPage(data, "pageAbout");
}

export interface SupportPageData {
  coverImage: CoverImage;
  content: { json: Document };
}

export async function getSupportPage(
  preview: boolean
): Promise<SupportPageData> {
  const data = await contentful(
    /* GraphQL */ `
    query {
      pageSupport(id: "Aa4GRMf6fuDtkH0UhkX19", preview: ${preview}) {
        coverImage {
          title
          description
          url
          width
          height
        }
        content {
          json
        }
      }
    }
  `,
    preview
  );

  return extractPage(data, "pageSupport");
}

export interface NewsletterPageData {
  coverImage: CoverImage;
  content: { json: Document };
}

export async function getNewsletterPage(
  preview: boolean
): Promise<NewsletterPageData> {
  const data = await contentful(
    /* GraphQL */ `
    query {
      pageNewsletter(id: "7t2jOQoBCZ6sGK4HgBZZ42", preview: ${preview}) {
        coverImage {
          title
          description
          url
          width
          height
        }
        content {
          json
        }
      }
    }
  `,
    preview
  );

  return extractPage(data, "pageNewsletter");
}

export async function getAllArtists(
  preview: boolean
): Promise<ArtistInterface[]> {
  const data = await contentful(
    /* GraphQL */ `
      query {
        artistCollection(order: name_ASC, preview: ${preview}) {
          items {
            name
            slug
            photo {
              title
              description
              url
              width
              height
            }
          }
        }
      }
    `,
    preview
  );

  return extractCollection(data, "artistCollection");
}

export async function getArtistAndMoreShows(
  slug: string,
  preview: boolean
): Promise<{ artist: ArtistInterface }> {
  const entry = await contentful(/* GraphQL */ `
    query {
      artistCollection(where: { slug: "${slug}" }, limit: 1, preview: ${preview}) {
        items {
          name
          slug
          photo {
            title
            description
            url
            width
            height
          }
        }
      }
    }
  `);

  return {
    artist: extractCollectionItem(entry, "artistCollection"),
  };
}

export async function getAllShows(preview: boolean): Promise<ShowInterface[]> {
  const data = await contentful(
    /* GraphQL */ `
      query {
        showCollection(order: date_DESC, preview: ${preview}) {
          items {
            title
            date
            slug
            mixcloudLink
            coverImage {
              title
              description
              url
              width
              height
            }
            artistsCollection(limit: 9) {
              items {
                name
              }
            }
            genresCollection(limit: 9) {
              items {
                name
              }
            }
            content {
              json
            }
          }
        }
      }
    `,
    preview
  );

  return extractCollection(data, "showCollection");
}

export async function getFeaturedShows(
  preview: boolean
): Promise<ShowInterface[]> {
  const data = await contentful(
    /* GraphQL */ `
      query {
        showCollection(
          order: date_DESC
          where: { isFeatured: true }
          limit: 15,
          preview: ${preview}
        ) {
          items {
            title
            date
            slug
            mixcloudLink
            coverImage {
              title
              description
              url
              width
              height
            }
            artistsCollection(limit: 9) {
              items {
                name
              }
            }
            genresCollection(limit: 9) {
              items {
                name
              }
            }
            content {
              json
            }
          }
        }
      }
    `,
    preview
  );

  const featuredShows = extractCollection(data, "showCollection");

  const pastFeaturedShows = featuredShows.filter((show) =>
    dayjs(show.date).isBefore(dayjs())
  );

  return pastFeaturedShows;
}

export async function getShowAndMoreShows(
  slug: string,
  preview: boolean
): Promise<{ show: ShowInterface }> {
  const entry = await contentful(
    /* GraphQL */ `
      query {
        showCollection(
          where: { slug: "${slug}" }
          order: date_DESC
          preview: ${preview}
          limit: 1
        ) {
          items {
            title
            date
            slug
            mixcloudLink
            coverImage {
              title
              description
              url
              width
              height
            }
            artistsCollection(limit: 9) {
              items {
                name
                slug
              }
            }
            genresCollection(limit: 9) {
              items {
                name
              }
            }
            content {
              json
            }
          }
        }
      }
    `,
    preview
  );

  return {
    show: extractCollectionItem(entry, "showCollection"),
  };
}

export async function getAllGenres(
  preview: boolean
): Promise<GenreInterface[]> {
  const data = await contentful(
    /* GraphQL */ `
      query {
        genreCollection(order: name_ASC, preview: ${preview}) {
          items {
            name
          }
        }
      }
    `,
    preview
  );

  return extractCollection(data, "genreCollection");
}

export async function getAllArticles(
  preview: boolean
): Promise<ArticleInterface[]> {
  const data = await contentful(
    /* GraphQL */ `
      query {
        articleCollection(order: date_DESC, preview: ${preview}) {
          items {
            title
            subtitle
            articleType
            date
            slug
            coverImage {
              title
              description
              url
              width
              height
            }
            content {
              json
            }
          }
        }
      }
    `,
    preview
  );

  return extractCollection(data, "articleCollection");
}

export async function getLatestArticles(
  preview: boolean
): Promise<ArticleInterface[]> {
  const data = await contentful(
    /* GraphQL */ `
      query {
        articleCollection(
          order: date_DESC
          where: { isFeatured: false }
          limit: 3
          preview: ${preview}
        ) {
          items {
            title
            subtitle
            articleType
            date
            slug
            coverImage {
              title
              description
              url
              width
              height
            }
            content {
              json
            }
          }
        }
      }
    `,
    preview
  );

  return extractCollection(data, "articleCollection");
}

export async function getFeaturedArticles(
  preview: boolean
): Promise<ArticleInterface[]> {
  const data = await contentful(
    /* GraphQL */ `
      query {
        articleCollection(
          where: { isFeatured: true }
          order: date_DESC
          limit: 3
          preview: ${preview}
        ) {
          items {
            title
            subtitle
            articleType
            date
            slug
            coverImage {
              title
              description
              url
              width
              height
            }
            content {
              json
            }
          }
        }
      }
    `,
    preview
  );

  return extractCollection(data, "articleCollection");
}

export async function getArticleAndMoreArticles(
  slug: string,
  preview: boolean
): Promise<{ article: ArticleInterface }> {
  const entry = await contentful(
    /* GraphQL */ `
      query {
        articleCollection(
          limit: 1
          where: { slug: "${slug}" }
          order: date_DESC
          preview: ${preview}
        ) {
          items {
            title
            subtitle
            articleType
            date
            slug
            coverImage {
              title
              description
              url
              width
              height
            }
            content {
              json
            }
          }
        }
      }
    `,
    preview
  );

  return {
    article: extractCollectionItem(entry, "articleCollection"),
  };
}
