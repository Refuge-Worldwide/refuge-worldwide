import { ArticleInterface } from "../types/shared";
import useSWRInfinite from "swr/infinite";
import {
  getArchiveArticles,
  NEWS_ARTICLES_PAGE_SIZE,
} from "../lib/contentful/pages/news";
import { useRouter } from "next/router";

export default function useNewsArchiveArticles(
  fallbackData: ArticleInterface[],
  type: string
) {
  const { data, setSize } = useSWRInfinite(
    (pageIndex) => `${type}-${pageIndex}`,
    async (pageIndex: number) =>
      getArchiveArticles(
        false,
        type,
        NEWS_ARTICLES_PAGE_SIZE,
        pageIndex * NEWS_ARTICLES_PAGE_SIZE
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
