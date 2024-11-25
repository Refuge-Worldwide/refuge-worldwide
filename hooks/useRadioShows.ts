import useSWRInfinite from "swr/infinite";
import { PastShowSchema } from "../types/shared";
import { RADIO_SHOWS_PAGE_SIZE } from "../lib/contentful/pages/radio";

const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return await response.json();
};

export default function useRadioShows(
  fallbackData: PastShowSchema[],
  filter: string[]
) {
  const { data, setSize, error, isValidating, isLoading } = useSWRInfinite(
    (pageIndex) =>
      `/api/shows?take=${RADIO_SHOWS_PAGE_SIZE}&skip=${
        pageIndex * RADIO_SHOWS_PAGE_SIZE
      }&filter=${encodeURIComponent(filter.join(","))}`,
    fetcher,
    {
      fallbackData: filter.length == 0 ? [fallbackData] : [],
      revalidateFirstPage: false,
    }
  );

  const shows = data.flat();

  const loadMore = () => setSize((size) => size + 1);

  const isReachingEnd =
    data?.[0]?.length === 0 ||
    data[data.length - 1]?.length < RADIO_SHOWS_PAGE_SIZE;

  return {
    shows,
    loadMore,
    isReachingEnd,
    isValidating,
    isLoading,
    isError: error,
  };
}
