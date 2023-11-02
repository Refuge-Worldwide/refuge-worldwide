import useSWR from "swr";
import { PastShowSchema } from "../types/shared";
import { RADIO_SHOWS_PAGE_SIZE } from "../lib/contentful/pages/radio";

async function getShows(url: URL) {
  const res = await fetch(url);

  return res.json();
}

export default function useCalendar(start: string, end: string) {
  const { data, error, isLoading } = useSWR(
    `/api/calendar?start=${start}&end=${end}`,
    getShows,
    {
      refreshInterval: 10 * 60 * 1000,
    }
  );

  return {
    calendar: data,
    isLoading,
    isError: error,
  };
}
