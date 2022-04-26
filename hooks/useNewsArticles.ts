import { ArticleInterface } from "../types/shared";
import useSWRInfinite from "swr/infinite";
import {
  getNewsPageArticles,
  NEWS_ARTICLES_PAGE_SIZE,
} from "../lib/contentful/pages/news";

export default function useNewsArticles(fallbackData: ArticleInterface[]) {
  const { data, setSize } = useSWRInfinite(
    (pageIndex) => ["NewsArticles", pageIndex * NEWS_ARTICLES_PAGE_SIZE],
    async (_, skip) =>
      getNewsPageArticles(false, NEWS_ARTICLES_PAGE_SIZE, skip as number),
    {
      fallbackData: [fallbackData],
      revalidateFirstPage: false,
    }
  );

  const articles = data.flat();

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
