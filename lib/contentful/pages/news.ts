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
  if (!skip) {
    // remove 2 items as we are adding in latest icymi and berlin stories articles
    limit = 10;
  } else {
    // account for removing 2 items from initial page
    skip = skip - 2;
  }
  const NewsPageArticlesQuery = /* GraphQL */ `
    query NewsPageArticlesQuery($preview: Boolean, $limit: Int, $skip: Int) {
      articleCollection(
        order: date_DESC
        preview: $preview
        limit: $limit
        skip: $skip
        where: {
          AND: [
            { title_not_contains: "Berlin Stories" }
            { title_not_contains: "ICYMI" }
          ]
        }
      ) {
        items {
          ...ArticlePreviewFragment
        }
      }
    }

    ${ArticlePreviewFragment}
  `;

  const NewsPageBSQuery = /* GraphQL */ `
    query NewsPageArticlesQuery($preview: Boolean) {
      articleCollection(
        order: date_DESC
        preview: $preview
        limit: 1
        skip: 0
        where: { title_contains: "Berlin Stories" }
      ) {
        items {
          ...ArticlePreviewFragment
        }
      }
    }

    ${ArticlePreviewFragment}
  `;

  const NewsPageICYMIQuery = /* GraphQL */ `
    query NewsPageArticlesQuery($preview: Boolean) {
      articleCollection(
        order: date_DESC
        preview: $preview
        limit: 1
        skip: 0
        where: { title_contains: "ICYMI" }
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
  const mainNews = extractCollection<ArticleInterface>(
    res,
    "articleCollection"
  );

  // if we are at start of news page get two latest icymi and berlin stories articles and add them to news articles array
  if (!skip) {
    const icymi = await graphql(NewsPageBSQuery, {
      variables: { preview },
      preview,
    });

    const bs = await graphql(NewsPageICYMIQuery, {
      variables: { preview },
      preview,
    });

    const icymiNews = extractCollection<ArticleInterface>(
      icymi,
      "articleCollection"
    );
    const bsNews = extractCollection<ArticleInterface>(bs, "articleCollection");
    mainNews.push(icymiNews[0]);
    mainNews.push(bsNews[0]);

    // sort main news by date.
    mainNews.sort(function (a, b) {
      return new Date(b.date).valueOf() - new Date(a.date).valueOf();
    });
  }

  return mainNews;
}

export async function getArchiveArticles(
  preview: boolean,
  type: string,
  limit?: number,
  skip?: number
) {
  const NewsPageArticlesQuery = /* GraphQL */ `
    query NewsPageArticlesQuery(
      $preview: Boolean
      $limit: Int
      $skip: Int
      $type: String
    ) {
      articleCollection(
        order: date_DESC
        preview: $preview
        limit: $limit
        skip: $skip
        where: { title_contains: $type }
      ) {
        items {
          ...ArticlePreviewFragment
        }
      }
    }

    ${ArticlePreviewFragment}
  `;

  const res = await graphql(NewsPageArticlesQuery, {
    variables: { preview, type, limit, skip },
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

export async function getArchiveNewsPage(preview: boolean, type: string) {
  return {
    articles: await getArchiveArticles(preview, type, NEWS_ARTICLES_PAGE_SIZE),
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
          sys {
            id
          }
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
              entries {
                block {
                  sys {
                    id
                  }
                  __typename
                  ... on Show {
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
                    mixcloudLink
                    slug
                    title
                    sys {
                      id
                    }
                  }
                }
              }
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
        preview: false
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
