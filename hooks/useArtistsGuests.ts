import useSWRInfinite from "swr/infinite";
import {
  ARTISTS_GUESTS_PAGE_SIZE,
  getArtistsPage,
} from "../lib/contentful/pages/artists";
import { AllArtistEntry } from "../types/shared";

const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return await response.json();
};

export default function useArtistsGuests(fallbackData: AllArtistEntry[]) {
  const { data, setSize, error, isValidating, isLoading } = useSWRInfinite(
    (pageIndex) =>
      `/api/artists?limit=${ARTISTS_GUESTS_PAGE_SIZE}&skip=${
        pageIndex * ARTISTS_GUESTS_PAGE_SIZE
      }&role=false`,
    fetcher,
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
