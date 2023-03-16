import useSWRInfinite from "swr/infinite";
import { PastShowSchema } from "../lib/contentful/client";
import { RADIO_SHOWS_PAGE_SIZE } from "../lib/contentful/pages/radio";

export default function useRadioShows(
  fallbackData: PastShowSchema[],
  filter: string[]
) {
  const { data, size, isValidating, setSize } = useSWRInfinite(
    (pageIndex) => ["RadioShows", pageIndex * RADIO_SHOWS_PAGE_SIZE, filter],
    async (_, skip) => {
      const r = await fetch(
        `/api/shows?take=${RADIO_SHOWS_PAGE_SIZE}&skip=${skip}&filter=${encodeURIComponent(
          filter.join(",")
        )}`
      );

      return await r.json();
    },
    {
      fallbackData: !filter ? [fallbackData] : [],
      revalidateFirstPage: false,
    }
  );

  const shows = data.flat();

  const loadMore = () => setSize((size) => size + 1);

  const isReachingEnd =
    data?.[0]?.length === 0 ||
    data[data.length - 1]?.length < RADIO_SHOWS_PAGE_SIZE;

  const isRefreshing = isValidating && data;

  return {
    shows,
    loadMore,
    isRefreshing,
    isReachingEnd,
  };
}
