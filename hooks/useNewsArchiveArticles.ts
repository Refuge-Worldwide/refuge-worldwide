import { ArticleInterface } from "../types/shared";
import useSWRInfinite from "swr/infinite";
import {
  getArchiveArticles,
  NEWS_ARTICLES_PAGE_SIZE,
} from "../lib/contentful/pages/news";

export default function useNewsArchiveArticles(
  fallbackData: ArticleInterface[],
  type: string
) {
  const { data, setSize } = useSWRInfinite(
    (pageIndex) => `${type}-${pageIndex * NEWS_ARTICLES_PAGE_SIZE}`,
    async (skip) =>
      getArchiveArticles(
        false,
        type,
        NEWS_ARTICLES_PAGE_SIZE,
        Number(skip.split("-")[1])
      ),
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
