import useSWR from "swr";
import { ShowInterface } from "../types/shared";
import useShows from "./useShows";

const getFilteredShows = (
  _: any,
  filter: string,
  allShows: ShowInterface[]
) => {
  if (filter === "All") return allShows;

  const includesGenreFilter = (show: ShowInterface) =>
    show.genresCollection.items.filter((genre) => genre.name === filter)
      .length > 0;

  return allShows.filter(includesGenreFilter);
};

export default function useFilteredShows(filter: string, preview = false) {
  const { data: allShows } = useShows(preview);

  return useSWR(["FilteredShows", filter, allShows], getFilteredShows);
}
