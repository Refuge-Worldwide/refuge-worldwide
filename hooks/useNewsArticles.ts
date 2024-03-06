import { ArticleInterface } from "../types/shared";
import useSWRInfinite from "swr/infinite";
import {
  getNewsPageArticles,
  NEWS_ARTICLES_PAGE_SIZE,
} from "../lib/contentful/pages/news";

export default function useNewsArticles(fallbackData: ArticleInterface[]) {
  const { data, setSize } = useSWRInfinite(
    (pageIndex) => [pageIndex * NEWS_ARTICLES_PAGE_SIZE],
    async (skip) =>
      getNewsPageArticles(false, NEWS_ARTICLES_PAGE_SIZE, skip[0]),
    {
      fallbackData: [fallbackData],
      revalidateFirstPage: false,
    }
  );

  const articles = data.flat();

  // const articles = filterArticles(allArticles);

  const loadMore = () => setSize((size) => size + 1);

  const isReachingEnd =
    data?.[0]?.length === 0 ||
    data[data.length - 1]?.length < NEWS_ARTICLES_PAGE_SIZE;

  return {
    articles,
    loadMore,
    isReachingEnd,
  };
}

function filterArticles(articles: ArticleInterface[]) {
  let berlinStories = 0;
  let icymi = 0;
  if (true) {
    return articles.filter((article) => {
      if (
        article.title.includes("Berlin Stories") ||
        article.title.includes("ICYMI")
      ) {
        return false;
      }
      return true;
    });
  } else {
    return articles.filter((article) => {
      if (article.title.includes("Berlin Stories")) {
        if (berlinStories == 0) {
          berlinStories++;
          return true;
        }
        return false;
      } else if (article.title.includes("ICYMI")) {
        if (icymi == 0) {
          icymi++;
          return true;
        }
        return false;
      } else {
        return true;
      }
    });
  }
}
