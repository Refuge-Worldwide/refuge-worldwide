import { graphql } from "..";
import { Content } from "../../../types/shared";

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
    query ArticlesRSSFeedQuery($skip: Int!) {
      articleCollection(order: date_DESC, limit: 1000, skip: $skip) {
        total
        items {
          ...ArticleRSSFeedFragment
        }
      }
    }

    ${ArticleRSSFeedFragment}
  `;

  // Contentful caps any single collection request at 1000 items, so loop
  // through pages in case the article count ever grows past that.
  const articles: ArticleRSSFeedEntry[] = [];
  let skip = 0;

  while (true) {
    const data = await graphql(ArticlesRSSFeedQuery, { variables: { skip } });
    const { items, total } = data.data.articleCollection;
    articles.push(...items);
    skip += items.length;
    if (items.length === 0 || skip >= total) break;
  }

  return articles;
}
