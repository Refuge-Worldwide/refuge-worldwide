import { graphql } from "..";
import {
  ArticleInterface,
  HomePageData,
  NextUpSection,
} from "../../../types/shared";
import { extractCollection, extractPage } from "../../../util";
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
            ...ShowPreviewFragment
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

    ${ShowPreviewFragment}
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

  return {
    featuredArticles: extractCollection<ArticleInterface>(
      data,
      "featuredArticles"
    ),
    featuredShows: extractPage<HomePageData>(data, "pageHome")
      .featuredShowsCollection.items,
    latestArticles: filteredArticles.slice(0, 6),
    nextUp: extractPage<NextUpSection>(data, "nextUp"),
  };
}
