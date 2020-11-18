import useSWR from "swr";
import { getAllGenres, getAllShows } from "../lib/api";

async function getShowsAndGenres(_: any, preview: boolean) {
  return {
    genres: await getAllGenres(preview),
    shows: await getAllShows(preview),
  };
}

export default function useShowsAndGenres(preview = false) {
  return useSWR(["ShowsAndGenres", preview], getShowsAndGenres);
}
