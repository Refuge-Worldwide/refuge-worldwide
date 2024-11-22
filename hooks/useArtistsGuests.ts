import useSWRInfinite from "swr/infinite";
import {
  ARTISTS_GUESTS_PAGE_SIZE,
  getArtistsPage,
} from "../lib/contentful/pages/artists";
import { AllArtistEntry } from "../types/shared";

export default function useArtistsGuests(fallbackData: AllArtistEntry[]) {
  const { data, setSize, error, isValidating, isLoading } = useSWRInfinite(
    (pageIndex) => [pageIndex * ARTISTS_GUESTS_PAGE_SIZE],
    async (skip) => {
      const r = await fetch(
        `/api/artists?limit=${ARTISTS_GUESTS_PAGE_SIZE}&skip=${skip}&role=false`
      );

      return await r.json();
    },
    {
      fallbackData: [fallbackData],
      revalidateFirstPage: false,
    }
  );

  const guests = data ? data.flat() : [];

  const loadMore = () => setSize((size) => size + 1);

  const isReachingEnd =
    data?.[0]?.length === 0 ||
    data[data.length - 1]?.length < ARTISTS_GUESTS_PAGE_SIZE;

  return {
    guests,
    loadMore,
    isReachingEnd,
    isValidating,
    isLoading,
    isError: error,
  };
}
