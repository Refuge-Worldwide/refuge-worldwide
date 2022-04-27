import useSWR from "swr";
import { PastShowType } from "../lib/contentful/pages/radio";

function getFilteredShows(_: string, filter: string, data: PastShowType[]) {
  if (filter === "All") return data;

  const includesGenreFilter = (show: PastShowType) =>
    show.genresCollection.items.filter((genre) => genre.name === filter)
      .length > 0;

  return data.filter(includesGenreFilter);
}

export default function useFilteredShows(data: PastShowType[], filter: string) {
  return useSWR(["FilteredShows", filter, data], getFilteredShows);
}
