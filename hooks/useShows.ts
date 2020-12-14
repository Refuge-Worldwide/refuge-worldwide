import dayjs from "dayjs";
import useSWR from "swr";
import { getAllShows } from "../lib/api";

async function getShows(_: any, preview: boolean) {
  const today = dayjs();

  const shows = await getAllShows(preview);

  const upcoming = shows.filter((show) => dayjs(show.date).isAfter(today));

  const past = shows.filter((show) => dayjs(show.date).isBefore(today));

  return { upcoming, past };
}

export default function useShows(preview = false) {
  return useSWR(["AllShows", preview], getShows, {
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
}
