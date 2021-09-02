import dayjs from "dayjs";
import memoryCache from "memory-cache";
import type {
  AboutPageData,
  AllArtistEntry,
  ArticleInterface,
  ArtistEntry,
  ArtistInterface,
  BookingsPageData,
  ErrorPayload,
  NewsletterPageData,
  NextUpSection,
  ShowInterface,
  SupportPageData,
} from "../types/shared";
import {
  extractCollection,
  extractCollectionItem,
  extractPage,
  sort,
} from "../util";
import { ENDPOINT } from "./constants";
import {
  AllArtistFragment,
  ArticlePreviewFragment,
  FeaturedArticleFragment,
  RelatedArticleFragment,
  ShowPreviewFragment,
} from "./fragments";

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
  ARTISTS: 500,
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

export async function getHomePage() {
  const today = dayjs().format("YYYY-MM-DD");

  const data = await contentful(/* GraphQL */ `
    query {
      featuredArticles: articleCollection(
        order: date_DESC
        where: { isFeatured: false }
        limit: 3
      ) {
        items {
          ...FeaturedArticleFragment
        }
      }

      featuredShows: showCollection(
        order: [date_DESC, title_ASC]
        where: { isFeatured: true, date_lt: "${today}" }
        limit: 16
      ) {
        items {
          ...ShowPreviewFragment
        }
      }

      latestArticles: articleCollection(
        order: date_DESC
        where: { isFeatured: false }
        limit: 3
      ) {
        items {
          ...ArticlePreviewFragment
        }
      }

      nextUp: sectionToday(id: "2bP8MlTMBYfe1paaxwwziy") {
        content {
          json
        }
      }
    }

    ${ShowPreviewFragment}
    ${FeaturedArticleFragment}
    ${ArticlePreviewFragment}
  `);

  return {
    featuredArticles: extractCollection<ArticleInterface>(
      data,
      "featuredArticles"
    ),
    featuredShows: extractCollection<ShowInterface>(data, "featuredShows"),
    latestArticles: extractCollection<ArticleInterface>(data, "latestArticles"),
    nextUp: extractPage(data, "nextUp") as NextUpSection,
  };
}

export async function getAboutPage(preview: boolean) {
  const data = await contentful(
    /* GraphQL */ `
      query {
        pageAbout(id: "z1SsoA1K4SMJryGuYjzhK", preview: ${preview}) {
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
    `,
    preview
  );

  return extractPage<AboutPageData>(data, "pageAbout");
}

export async function getSupportPage(
  preview: boolean
): Promise<SupportPageData> {
  const data = await contentful(
    /* GraphQL */ `
    query {
      pageSupport(id: "Aa4GRMf6fuDtkH0UhkX19", preview: ${preview}) {
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
  `,
    preview
  );

  return extractPage(data, "pageSupport");
}

export async function getNewsletterPage(
  preview: boolean
): Promise<NewsletterPageData> {
  const data = await contentful(
    /* GraphQL */ `
    query {
      pageNewsletter(id: "7t2jOQoBCZ6sGK4HgBZZ42", preview: ${preview}) {
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
  `,
    preview
  );

  return extractPage(data, "pageNewsletter");
}

export async function getBookingsPage(
  preview: boolean
): Promise<BookingsPageData> {
  const data = await contentful(/* GraphQL */ `
    query {
      pageBooking(id: "5ApzlspIzqeUmURGvpTCug", preview: ${preview}) {
        bookingPassword
      }
    }
  `);

  return extractPage(data, "pageBooking");
}

export async function getNewsPage(preview: boolean, limit = LIMITS.ARTICLES) {
  const data = await contentful(/* GraphQL */ `
    query {
      articles: articleCollection(
        order: date_DESC
        preview: ${preview}
        limit: ${limit}
      ) {
        items {
          ...ArticlePreviewFragment
        }
      }

      featuredArticles: articleCollection(
        where: { isFeatured: true }
        order: date_DESC
        limit: 3
        preview: ${preview}
      ) {
        items {
          ...FeaturedArticleFragment
        }
      }
    }

    ${ArticlePreviewFragment}
    ${FeaturedArticleFragment}
  `);

  return {
    articles: extractCollection<ArticleInterface>(data, "articles"),
    featuredArticles: extractCollection<ArticleInterface>(
      data,
      "featuredArticles"
    ),
  };
}

export async function getAllArtists(preview: boolean, limit = LIMITS.ARTISTS) {
  const data = await contentful(
    /* GraphQL */ `
      query {
        artistCollection(order: name_ASC, preview: ${preview}, limit: ${limit}) {
          items {
            ...AllArtistFragment
          }
        }
      }

      ${AllArtistFragment}
    `,
    preview
  );

  return extractCollection<AllArtistEntry>(data, "artistCollection");
}

export async function getAllArtistPaths() {
  const data = await contentful(/* GraphQL */ `
    query {
      artistCollection(where: { slug_exists: true }, limit: ${LIMITS.ARTISTS}) {
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

export async function getAllShowPaths() {
  const data = await contentful(/* GraphQL */ `
    query {
      showCollection(where: { slug_exists: true }, limit: 500) {
        items {
          slug
        }
      }
    }
  `);

  const collection = extractCollection<{ slug: string }>(
    data,
    "showCollection"
  );

  const paths = collection.map((el) => ({
    params: { slug: el.slug },
  }));

  return paths;
}

export async function getRadioPage(preview: boolean) {
  const today = dayjs();

  const shows = await getAllShows(preview);

  /**
   * Upcoming & Featured
   */
  const upcomingShows = shows
    .sort(sort.date_ASC)
    .filter((show) => dayjs(show.date).isAfter(today))
    .filter((show) => show.isFeatured);

  /**
   * All Past Shows
   */
  const pastShows = shows
    .sort(sort.date_DESC)
    .filter((show) => dayjs(show.date).isBefore(today));

  /**
   * All Past Show Genres
   */
  const pastShowGenres = pastShows
    .flatMap((show) => show.genresCollection.items)
    .filter((genre) => Boolean(genre?.name))
    .map((genre) => genre.name);

  const genres = Array.from(new Set(pastShowGenres)).sort(sort.alpha);

  return {
    upcomingShows,
    pastShows,
    genres,
  };
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

export async function getAllArticlePaths() {
  const data = await contentful(/* GraphQL */ `
    query {
      articleCollection(where: { slug_exists: true }, limit: 500) {
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

export async function getPaths() {
  const data = await contentful(/* GraphQL */ `
    {
      shows: showCollection(limit: 1000) {
        items {
          slug
        }
        total
      }
      artists: artistCollection(limit: 1000) {
        items {
          slug
        }
        total
      }
      articles: articleCollection(limit: 1000) {
        items {
          slug
        }
        total
      }
    }
  `);

  return {
    shows: extractCollection<{ slug: string }>(data, "shows"),
    articles: extractCollection<{ slug: string }>(data, "articles"),
    artists: extractCollection<{ slug: string }>(data, "artists"),
  };
}

export async function getSearchData() {
  const today = dayjs().format("YYYY-MM-DD");

  const articleData = await contentful(/* GraphQL */ `
    query {
      articleCollection(limit: 2500, order: date_DESC) {
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
          title
          slug
          date
          articleType
        }
      }
    }
  `);

  const artistData = await contentful(/* GraphQL */ `
    query {
      artistCollection(limit: 2500, order: name_ASC) {
        items {
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
          title: name
          slug
        }
      }
    }
  `);

  const showData = await contentful(/* GraphQL */ `
    query {
      showCollection(
        limit: 2200
        order: date_DESC
        where: { date_lt: "${today}" }
      ) {
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
          genresCollection(limit: 3) {
            items {
              name
            }
          }
          title
          slug
          date
        }
      }
    }
  `);

  const articleCollection = extractCollection<ArticleInterface>(
    articleData,
    "articleCollection"
  ).map((el) => ({ ...el, type: "ARTICLE" }));

  const artistCollection = extractCollection<ArtistInterface>(
    artistData,
    "artistCollection"
  ).map((el) => ({ ...el, type: "ARTIST" }));

  const showCollection = extractCollection<ShowInterface>(
    showData,
    "showCollection"
  ).map((el) => ({ ...el, type: "SHOW" }));

  return [...showCollection, ...articleCollection, ...artistCollection];
}
