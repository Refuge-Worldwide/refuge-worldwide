import { graphql } from "..";
import {
  ArticleInterface,
  HomePageData,
  NextUpSection,
  ShowInterface,
} from "../../../types/shared";
import { extractCollection, extractPage } from "../../../util";
import {
  ArticlePreviewFragment,
  FeaturedArticleFragment,
  ShowPreviewFragment,
} from "../fragments";

export async function getHomePage() {
  const HomePageQuery = /* GraphQL */ `
    query HomePageQuery() {
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

  const data = await graphql(HomePageQuery);

  return {
    featuredArticles: extractCollection<ArticleInterface>(
      data,
      "featuredArticles"
    ),
    featuredShows: extractPage<HomePageData>(data, "pageHome")
      .featuredShowsCollection.items,
    latestArticles: extractCollection<ArticleInterface>(data, "latestArticles"),
    nextUp: extractPage<NextUpSection>(data, "nextUp"),
  };
}
