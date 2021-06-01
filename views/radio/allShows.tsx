import { useState } from "react";
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

  const [showCount, showCountSet] = useState(50);

  const loadMore = () => showCountSet((count) => count + 50);

  return (
    <section>
      <div className="p-4 sm:p-8">
        <Pill>
          <h2>{filter} Shows</h2>
        </Pill>

        <div className="h-5 sm:h-8" />

        <GenresList genres={genres} filter={filter} filterSet={filterSet} />

        <div className="h-4" />

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 sm:gap-8">
          {shows?.slice(0, showCount)?.map((show, i) => (
            <li key={i}>
              <ShowPreview {...show} />
            </li>
          ))}
        </ul>

        {showCount < shows?.length && (
          <div className="flex justify-center mt-10 sm:mt-8">
            <button
              onClick={loadMore}
              className="inline-flex focus:outline-none rounded-full items-center justify-center group"
              aria-label="Load more shows"
            >
              <img src="/images/load-more-button.svg" alt="" aria-hidden />

              <span
                className="absolute rounded-full h-20 w-20 group-focus:ring-4"
                aria-hidden
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
