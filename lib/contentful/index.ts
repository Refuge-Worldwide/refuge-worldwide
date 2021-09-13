import dayjs from "dayjs";
import { GRAPHCDN_ENDPOINT } from "../../constants";
import type {
  ArticleInterface,
  ArtistEntry,
  ErrorPayload,
  ShowInterface,
} from "../../types/shared";
import { extractCollection, extractCollectionItem, sort } from "../../util";
import { RelatedArticleFragment } from "./fragments";

const LIMITS = {
  SHOWS: 550,
  ARTISTS: 2000,
  ARTICLES: 100,
};

function getErrorMessage(payload: ErrorPayload) {
  return payload.errors[0].message;
}

interface GraphQLInterface {
  variables?: Record<string, string | boolean | number>;
  preview?: boolean;
}

export async function graphql(
  query: string,
  { preview, variables }: GraphQLInterface = { preview: false, variables: {} }
) {
  const r = await fetch(GRAPHCDN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${
        preview
          ? process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN
          : process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
      }`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (r.ok) {
    return r.json();
  }

  throw new Error(getErrorMessage(await r.json()));
}

export async function getArtistAndRelatedShows(slug: string, preview: boolean) {
  const today = dayjs();

  const ArtistAndRelatedShowsQuery = /* GraphQL */ `
    query ArtistAndRelatedShowsQuery($slug: String, $preview: Boolean) {
      artistCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
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
  `;

  const entry = await graphql(ArtistAndRelatedShowsQuery, {
    variables: { slug, preview },
    preview,
  });

  const artist = extractCollectionItem<ArtistEntry>(entry, "artistCollection");

  if (!artist) {
    throw new Error(`No Artist found for slug '${slug}'`);
  }

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
  const AllShowsQuery = /* GraphQL */ `
    query AllShowsQuery($preview: Boolean, $limit: Int) {
      showCollection(
        order: date_DESC
        where: { artistsCollection_exists: true }
        preview: $preview
        limit: $limit
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
          }
        }
      }
    }
  `;

  const data = await graphql(AllShowsQuery, {
    variables: { preview, limit },
    preview,
  });

  return extractCollection<ShowInterface>(data, "showCollection");
}

export async function getShowAndMoreShows(slug: string, preview: boolean) {
  const today = dayjs();

  const ShowAndMoreShowsQuery = /* GraphQL */ `
    query ShowAndMoreShowsQuery($slug: String, $preview: Boolean) {
      showCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
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
  `;

  const data = await graphql(ShowAndMoreShowsQuery, {
    variables: { slug, preview },
    preview,
  });

  const entry: ShowInterface = extractCollectionItem(data, "showCollection");

  if (!entry) {
    throw new Error(`No Show found for slug '${slug}'`);
  }

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
  const ArticleAndMoreArticlesQuery = /* GraphQL */ `
    query ArticleAndMoreArticlesQuery($slug: String, $preview: Boolean) {
      article: articleCollection(
        where: { slug: $slug }
        limit: 1
        preview: $preview
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
        where: { slug_not: $slug }
        order: date_DESC
        preview: $preview
      ) {
        items {
          ...RelatedArticleFragment
        }
      }
    }

    ${RelatedArticleFragment}
  `;

  const data = await graphql(ArticleAndMoreArticlesQuery, {
    variables: { slug, preview },
    preview,
  });

  const article = extractCollectionItem<ArticleInterface>(data, "article");

  if (!article) {
    throw new Error(`No Article found for slug '${slug}'`);
  }

  const relatedArticles = extractCollection<ArticleInterface>(
    data,
    "relatedArticles"
  );

  return {
    article,
    relatedArticles,
  };
}
