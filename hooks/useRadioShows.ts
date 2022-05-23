import useSWRInfinite from "swr/infinite";
import { RADIO_SHOWS_PAGE_SIZE } from "../lib/contentful/pages/radio";

export default function useRadioShows(
  fallbackData: {
    date: string;
    updatedAt: string;
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    mixcloudLink: string;
  }[],
  filter: string
) {
  const { data, setSize } = useSWRInfinite(
    (pageIndex) => ["RadioShows", pageIndex * RADIO_SHOWS_PAGE_SIZE, filter],
    async (_, skip) => {
      const r = await fetch(
        `/api/shows-db?take=${RADIO_SHOWS_PAGE_SIZE}&skip=${skip}&filter=${encodeURIComponent(
          filter
        )}`
      );

      return await r.json();
    },
    {
      fallbackData: filter === "All" ? [fallbackData] : [],
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
  };
}
