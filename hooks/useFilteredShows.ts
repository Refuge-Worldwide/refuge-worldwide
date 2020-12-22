import useSWR from "swr";
import { ShowInterface } from "../types/shared";

const getFilteredShows = (_: any, filter: string, data: ShowInterface[]) => {
  if (filter === "All") return data;

  const includesGenreFilter = (show: ShowInterface) =>
    show.genresCollection.items.filter((genre) => genre.name === filter)
      .length > 0;

  return data.filter(includesGenreFilter);
};

export default function useFilteredShows(
  data: ShowInterface[],
  filter: string
) {
  return useSWR(["FilteredShows", filter, data], getFilteredShows);
}
