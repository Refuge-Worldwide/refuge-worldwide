import { graphql } from "..";
import { ArticleInterface } from "../../../types/shared";
import { extractCollection, extractCollectionItem } from "../../../util";
import {
  ArticlePreviewFragment,
  FeaturedArticleFragment,
  RelatedArticleFragment,
} from "../fragments";

export const NEWS_ARTICLES_PAGE_SIZE = 12;

export async function getNewsPageArticles(
  preview: boolean,
  limit?: number,
  skip?: number
) {
  const NewsPageArticlesQuery = /* GraphQL */ `
    query NewsPageArticlesQuery($preview: Boolean, $limit: Int, $skip: Int) {
      articleCollection(
        order: date_DESC
        preview: $preview
        limit: $limit
        skip: $skip
      ) {
        items {
          ...ArticlePreviewFragment
        }
      }
    }

    ${ArticlePreviewFragment}
  `;

  const res = await graphql(NewsPageArticlesQuery, {
    variables: { preview, limit, skip },
    preview,
  });

  return extractCollection<ArticleInterface>(res, "articleCollection");
}

export async function getNewsPageFeaturedArticles(preview: boolean) {
  const FeaturedArticlesNewsPageQuery = /* GraphQL */ `
    query FeaturedArticlesNewsPageQuery($preview: Boolean) {
      articleCollection(
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
    ${FeaturedArticleFragment}
  `;

  const res = await graphql(FeaturedArticlesNewsPageQuery, {
    variables: { preview },
    preview,
  });

  return extractCollection<ArticleInterface>(res, "articleCollection");
}

export async function getNewsPage(preview: boolean) {
  return {
    articles: await getNewsPageArticles(preview, NEWS_ARTICLES_PAGE_SIZE),
    featuredArticles: await getNewsPageFeaturedArticles(preview),
  };
}

export async function getNewsPageSingle(slug: string, preview: boolean) {
  const NewsPageSingleQuery = /* GraphQL */ `
    query NewsPageSingleQuery($slug: String, $preview: Boolean) {
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

  const data = await graphql(NewsPageSingleQuery, {
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
