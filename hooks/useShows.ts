import useSWR from "swr";
import { getAllShows } from "../lib/api";

async function getShows(_: any, preview: boolean) {
  const shows = await getAllShows(preview);

  return shows;
}

export default function useShows(preview = false) {
  return useSWR(["AllShows", preview], getShows, {
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
}
