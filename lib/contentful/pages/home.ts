import dayjs from "dayjs";
import { graphql } from "..";
import {
  ArticleInterface,
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
    nextUp: extractPage<NextUpSection>(data, "nextUp"),
  };
}
