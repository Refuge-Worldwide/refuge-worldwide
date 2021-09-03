import dayjs from "dayjs";
import { graphql, getAllShows } from ".";
import type {
  AboutPageData,
  AllArtistEntry,
  ArticleInterface,
  ArtistInterface,
  BookingsPageData,
  NewsletterPageData,
  NextUpSection,
  ShowInterface,
  SupportPageData,
} from "../../types/shared";
import { extractCollection, extractPage, sort } from "../../util";
import {
  AllArtistFragment,
  ArticlePreviewFragment,
  FeaturedArticleFragment,
  ShowPreviewFragment,
} from "./fragments";

export async function getHomePage() {
  const today = dayjs().format("YYYY-MM-DD");

  const HomePageQuery = /* GraphQL */ `
    query HomePageQuery($today: DateTime) {
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
        where: { isFeatured: true, date_lt: $today }
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
  `;

  const data = await graphql(HomePageQuery, {
    variables: { today },
  });

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
  const AboutPageQuery = /* GraphQL */ `
    query AboutPageQuery($preview: Boolean) {
      pageAbout(id: "z1SsoA1K4SMJryGuYjzhK", preview: $preview) {
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
  `;

  const data = await graphql(AboutPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<AboutPageData>(data, "pageAbout");
}

export async function getSupportPage(preview: boolean) {
  const SupportPageQuery = /* GraphQL */ `
    query SupportPageQuery($preview: Boolean) {
      pageSupport(id: "Aa4GRMf6fuDtkH0UhkX19", preview: $preview) {
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
  `;

  const data = await graphql(SupportPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<SupportPageData>(data, "pageSupport");
}

export async function getNewsletterPage(preview: boolean) {
  const NewsletterPageQuery = /* GraphQL */ `
    query NewsletterPageQuery($preview: Boolean) {
      pageNewsletter(id: "7t2jOQoBCZ6sGK4HgBZZ42", preview: $preview) {
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
  `;

  const data = await graphql(NewsletterPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<NewsletterPageData>(data, "pageNewsletter");
}

export async function getBookingsPage(preview: boolean) {
  const BookingPageQuery = /* GraphQL */ `
    query BookingPageQuery($preview: Boolean) {
      pageBooking(id: "5ApzlspIzqeUmURGvpTCug", preview: $preview) {
        bookingPassword
      }
    }
  `;

  const data = await graphql(BookingPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<BookingsPageData>(data, "pageBooking");
}

export async function getNewsPage(preview: boolean) {
  const NewsPageQuery = /* GraphQL */ `
    query NewsPageQuery($preview: Boolean) {
      articles: articleCollection(
        order: date_DESC
        preview: $preview
        limit: 100
      ) {
        items {
          ...ArticlePreviewFragment
        }
      }

      featuredArticles: articleCollection(
        where: { isFeatured: true }
        order: date_DESC
        limit: 3
        preview: $preview
      ) {
        items {
          ...FeaturedArticleFragment
        }
      }
    }

    ${ArticlePreviewFragment}
    ${FeaturedArticleFragment}
  `;

  const data = await graphql(NewsPageQuery, {
    variables: { preview },
    preview,
  });

  return {
    articles: extractCollection<ArticleInterface>(data, "articles"),
    featuredArticles: extractCollection<ArticleInterface>(
      data,
      "featuredArticles"
    ),
  };
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

export async function getArtistsPage() {
  const ArtistsPageQuery = /* GraphQL */ `
    query ArtistsPageQuery {
      artistCollection(order: name_ASC, limit: 2000) {
        items {
          ...AllArtistFragment
        }
      }
    }

    ${AllArtistFragment}
  `;

  const data = await graphql(ArtistsPageQuery);

  return extractCollection<AllArtistEntry>(data, "artistCollection");
}

export async function getSearchPage() {
  const today = dayjs().format("YYYY-MM-DD");

  const ArticleDataQuery = /* GraphQL */ `
    query ArticleDataQuery {
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
  `;

  const articleData = await graphql(ArticleDataQuery);

  const ArtistDataQuery = /* GraphQL */ `
    query ArtistDataQuery {
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
  `;

  const artistData = await graphql(ArtistDataQuery);

  const ShowDataQuery = /* GraphQL */ `
    query ShowDataQuery($today: DateTime) {
      showCollection(
        limit: 2200
        order: date_DESC
        where: { date_lt: $today }
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
  `;

  const showData = await graphql(ShowDataQuery, {
    variables: { today },
  });

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
