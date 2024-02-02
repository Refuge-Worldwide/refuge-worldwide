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
import { getCollectionPageSingle } from "./radio";

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
        limit: 6
      ) {
        items {
          ...ArticlePreviewFragment
        }
      }
    }

    ${ShowPreviewFragment}
    ${FeaturedArticleFragment}
    ${ArticlePreviewFragment}
  `;

  const data = await graphql(HomePageQuery);

  const featuredCollection = await getCollectionPageSingle(
    "energy-crew",
    false
  );

  return {
    featuredArticles: extractCollection<ArticleInterface>(
      data,
      "featuredArticles"
    ),
    featuredShows: extractPage<HomePageData>(data, "pageHome")
      .featuredShowsCollection.items,
    latestArticles: extractCollection<ArticleInterface>(data, "latestArticles"),
    featuredCollection: featuredCollection,
  };
}
