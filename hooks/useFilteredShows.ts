import useShowsAndGenres from "./useShowsAndGenres";

export default function useFilteredShows() {
  const { data } = useShowsAndGenres();

  function filterShows(genre: string) {
    return data.shows.filter((show) => {
      show.genresCollection.items.filter(({ name }) => name === genre).length >
        0;
    });
  }

  return { data, filterShows };
}
