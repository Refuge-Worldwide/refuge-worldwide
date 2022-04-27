import useSWRInfinite from "swr/infinite";
import {
  getPastShows,
  PastShowType,
  RADIO_SHOWS_PAGE_SIZE,
} from "../lib/contentful/pages/radio";

export default function useRadioShows(
  fallbackData: PastShowType[],
  filter: string
) {
  const { data, setSize } = useSWRInfinite(
    (pageIndex) => ["RadioShows", pageIndex * RADIO_SHOWS_PAGE_SIZE, filter],
    async (_, skip) =>
      getPastShows(false, RADIO_SHOWS_PAGE_SIZE, skip as number, filter),
    {
      fallbackData: [fallbackData],
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
