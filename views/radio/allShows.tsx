import Badge from "../../components/badge";
import GenresList from "../../components/genresList";
import Pill from "../../components/pill";
import ShowPreview from "../../components/showPreview";
import useFilteredShows from "../../hooks/useFilteredShows";
import useGenreFilter from "../../hooks/useGenreFilter";
import { ShowInterface } from "../../types/shared";

export default function AllShows({
  genres,
  pastShows,
}: {
  genres: string[];
  pastShows: ShowInterface[];
}) {
  const { filter, filterSet } = useGenreFilter();
  const { data: shows } = useFilteredShows(pastShows, filter);

  return (
    <section>
      <div className="p-4 sm:p-8">
        <Pill>
          <h2>All Shows</h2>
        </Pill>

        <div className="h-5 sm:h-8" />

        <GenresList genres={genres} filter={filter} filterSet={filterSet} />

        <div className="h-4" />

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 sm:gap-8">
          {shows?.map((show, i) => (
            <li key={i}>
              <ShowPreview {...show} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
