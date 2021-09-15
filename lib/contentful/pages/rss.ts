import { graphql } from "..";
import { Content } from "../../../types/shared";
import { extractCollection } from "../../../util";

type ArticleRSSFeedEntry = {
  author?: {
    name: string;
  };
  content: Content;
  coverImage: {
    url: string;
  };
  date: string;
  slug: string;
  subtitle?: string;
  title: string;
};

export const ArticleRSSFeedFragment = /* GraphQL */ `
  fragment ArticleRSSFeedFragment on Article {
    author {
      name
    }
    content {
      json
    }
    coverImage {
      url
    }
    date
    slug
    subtitle
    title
  }
`;

export async function getRSSFeed() {
  const ArticlesRSSFeedQuery = /* GraphQL */ `
    query ArticlesRSSFeedQuery {
      articleCollection(order: date_DESC, limit: 100) {
        items {
          ...ArticleRSSFeedFragment
        }
      }
    }

    ${ArticleRSSFeedFragment}
  `;

  const data = await graphql(ArticlesRSSFeedQuery);

  return extractCollection<ArticleRSSFeedEntry>(data, "articleCollection");
}
