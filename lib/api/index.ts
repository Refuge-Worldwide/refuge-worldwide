import dayjs from "dayjs";
import memoryCache from "memory-cache";
import type {
  AllArtistEntry,
  ArticleInterface,
  ArtistEntry,
  ErrorPayload,
  ShowInterface,
} from "../../types/shared";
import { extractCollection, extractCollectionItem, sort } from "../../util";
import { ENDPOINT } from "../constants";
import { AllArtistFragment, RelatedArticleFragment } from "../fragments";

async function contentfulWithCache(
  key: string,
  query: string,
  preview = false
) {
  const value = memoryCache.get(key);

  if (value) {
    return value;
  } else {
    const data = await contentful(query, preview);

    memoryCache.put(key, data, 1000 * 60 * 60);

    return data;
  }
}

const LIMITS = {
  SHOWS: 550,
  ARTISTS: 2000,
  ARTICLES: 100,
};

function getErrorMessage(payload: ErrorPayload) {
  return payload.errors[0].message;
}

export async function contentful(query: string, preview = false) {
  const r = await fetch(ENDPOINT, {
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
  });

  if (r.ok) {
    return r.json();
  }

  throw new Error(getErrorMessage(await r.json()));
}

export async function getAllArtists(limit = LIMITS.ARTISTS) {
  const data = await contentful(/* GraphQL */ `
      query {
        artistCollection(order: name_ASC, limit: ${limit}) {
          items {
            ...AllArtistFragment
          }
        }
      }

      ${AllArtistFragment}
    `);

  return extractCollection<AllArtistEntry>(data, "artistCollection");
}

export async function getArtistAndRelatedShows(slug: string, preview: boolean) {
  const today = dayjs();

  const entry = await contentful(/* GraphQL */ `
    query {
      artistCollection(where: { slug: "${slug}" }, limit: 1, preview: ${preview}) {
        items {
          sys {
            id
          }
          name
          slug
          photo {
            sys {
              id
            }
            title
            description
            url
            width
            height
          }
          coverImagePosition
          content {
            json
            links {
              assets {
                block {
                  sys {
                    id
                  }
                  contentType
                  title
                  description
                  url
                  width
                  height
                }
              }
            }
          }
          linkedFrom {
            showCollection(limit: 900) {
              items {
                slug
                title
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
              }
            }
          }
        }
      }
    }
  `);

  const artist = extractCollectionItem<ArtistEntry>(entry, "artistCollection");

  let relatedShows: ShowInterface[] = [];

  const date_lt_TODAY = (show: ShowInterface) =>
    dayjs(show.date).isBefore(today);

  const linkedFrom = artist.linkedFrom.showCollection.items;

  const linkedFromFiltered = linkedFrom.filter(date_lt_TODAY);

  if (linkedFromFiltered.length > 0) {
    relatedShows = linkedFromFiltered.sort(sort.date_DESC);
  }

  return {
    artist,
    relatedShows,
  };
}

export async function getAllShows(preview: boolean, limit = LIMITS.SHOWS) {
  const data = await contentfulWithCache(
    "getAllShows",
    /* GraphQL */ `
      query {
        showCollection(order: date_DESC, where: { artistsCollection_exists: true }, preview: ${preview}, limit: ${limit}) {
          items {
            title
            date
            slug
            mixcloudLink
            isFeatured
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
            coverImagePosition
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

  return extractCollection<ShowInterface>(data, "showCollection");
}

export async function getShowAndMoreShows(slug: string, preview: boolean) {
  const today = dayjs();

  const data = await contentful(
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
            isFeatured
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
            coverImagePosition
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
              links {
                assets {
                  block {
                    sys {
                      id
                    }
                    contentType
                    title
                    description
                    url
                    width
                    height
                  }
                }
              }
            }
          }
        }
      }
    `,
    preview
  );

  const entry: ShowInterface = extractCollectionItem(data, "showCollection");
  const entryGenres = entry.genresCollection.items.map((genre) => genre.name);

  const allShows = await getAllShows(preview);

  const relatedShows = allShows.filter((filterShow) => {
    const currentShowGenres = filterShow.genresCollection.items.map(
      (genre) => genre.name
    );

    const isRelatedShowFilter =
      currentShowGenres.filter((genre) => entryGenres.includes(genre)).length >
      0;

    const isNotOwnShow = filterShow.slug !== slug;

    const isPastFilter = dayjs(filterShow.date).isBefore(today);

    return isNotOwnShow && isRelatedShowFilter && isPastFilter;
  });

  return {
    show: entry,
    relatedShows,
  };
}

export async function getArticleAndMoreArticles(
  slug: string,
  preview: boolean
) {
  const data = await contentful(
    /* GraphQL */ `
      query {
        article: articleCollection(
          limit: 1
          where: { slug: "${slug}" }
          order: date_DESC
          preview: ${preview}
        ) {
          items {
            title
            subtitle
            articleType
            author { 
              name
            }
            date
            slug
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
            coverImagePosition
            content {
              json
              links {
                assets {
                  block {
                    sys {
                      id
                    }
                    contentType
                    title
                    description
                    url
                    width
                    height
                  }
                }
              }
            }
          }
        }

        relatedArticles: articleCollection(
          limit: 3
          where: { slug_not: "${slug}" }
          order: date_DESC
          preview: ${preview}
        ) {
          items {
            ...RelatedArticleFragment
          }
        }
      }

      ${RelatedArticleFragment}
    `,
    preview
  );

  return {
    article: extractCollectionItem<ArticleInterface>(data, "article"),
    relatedArticles: extractCollection<ArticleInterface>(
      data,
      "relatedArticles"
    ),
  };
}
