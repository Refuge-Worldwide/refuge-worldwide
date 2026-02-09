import { graphql } from "..";
import {
  ArticleInterface,
  HomePageData,
  NextUpSection,
  PastShowSchema,
} from "../../../types/shared";
import {
  extractCollection,
  extractPage,
  placeholderImage,
} from "../../../util";
import {
  ArticlePreviewFragment,
  FeaturedArticleFragment,
  ShowPreviewFragment,
} from "../fragments";

export async function getHomePage() {
  const HomePageQuery = /* GraphQL */ `
    query HomePageQuery {
      featuredArticles: articleCollection(
        order: date_DESC
        where: { isFeatured: true }
        limit: 3
      ) {
        items {
          ...FeaturedArticleFragment
        }
      }

      pageHome(id: "3xN3mbIMb4CwtrZqlRbYyu") {
        featuredShowsCollection {
          items {
            sys {
              id
            }
            title
            date
            slug
            mixcloudLink
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
            genresCollection(limit: 9) {
              items {
                name
              }
            }
            artwork {
              sys {
                id
              }
              title
              description
              url
              width
              height
            }
            audioFile {
              sys {
                id
              }
              title
              description
              url
            }
          }
        }
      }

      latestArticles: articleCollection(
        order: date_DESC
        where: { isFeatured: false }
        limit: 20
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

    ${FeaturedArticleFragment}
    ${ArticlePreviewFragment}
  `;

  const data = await graphql(HomePageQuery);

  let latestArticles = extractCollection<ArticleInterface>(
    data,
    "latestArticles"
  );
  let icymi = false;
  let bs = false;

  const filteredArticles = latestArticles.filter((article) => {
    if (article.title.includes("ICYMI")) {
      if (!icymi) {
        icymi = true;
        return true;
      }
      return false;
    } else if (article.title.includes("Berlin Stories")) {
      if (!bs) {
        bs = true;
        return true;
      }
      return false;
    }
    return true;
  });

  // latestArticles.filter(article => {
  //   return article.title.includes("Berlin Stories") && !icymi
  // })

  const pageHome = extractPage<HomePageData>(data, "pageHome");
  const rawFeaturedShows = pageHome.featuredShowsCollection.items;

  // Transform featured shows to PastShowSchema format
  const featuredShows: PastShowSchema[] = rawFeaturedShows.map((show: any) => ({
    id: show.sys.id,
    title: show.title,
    date: show.date,
    slug: show.slug,
    mixcloudLink: show.mixcloudLink,
    coverImage: show.coverImage?.url || placeholderImage.url,
    genres:
      show.genresCollection?.items
        .map((genre: any) => genre?.name)
        .filter(Boolean) || [],
    artwork: show.artwork?.url || null,
    audioFile: show.audioFile?.url || null,
  }));

  return {
    featuredArticles: extractCollection<ArticleInterface>(
      data,
      "featuredArticles"
    ),
    featuredShows,
    latestArticles: filteredArticles.slice(0, 6),
    nextUp: extractPage<NextUpSection>(data, "nextUp"),
  };
}
