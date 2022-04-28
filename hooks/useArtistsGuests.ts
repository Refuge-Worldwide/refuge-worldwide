import useSWRInfinite from "swr/infinite";
import {
  ARTISTS_GUESTS_PAGE_SIZE,
  getArtistsPage,
} from "../lib/contentful/pages/artists";
import { AllArtistEntry } from "../types/shared";

export default function useArtistsGuests(fallbackData: AllArtistEntry[]) {
  const { data, setSize } = useSWRInfinite(
    (pageIndex) => ["ArtistsGuests", pageIndex * ARTISTS_GUESTS_PAGE_SIZE],
    async (_, skip) =>
      getArtistsPage(false, ARTISTS_GUESTS_PAGE_SIZE, skip as number),
    {
      fallbackData: [fallbackData],
      revalidateFirstPage: false,
    }
  );

  const guests = data.flat();

  const loadMore = () => setSize((size) => size + 1);

  const isReachingEnd =
    data?.[0]?.length === 0 ||
    data[data.length - 1]?.length < ARTISTS_GUESTS_PAGE_SIZE;

  return {
    guests,
    loadMore,
    isReachingEnd,
  };
}
