import GenresList from "../../components/genresList";
import Pill from "../../components/pill";
import ShowPreview from "../../components/showPreview";
import useGenreFilter from "../../hooks/useGenreFilter";
import useRadioShows from "../../hooks/useRadioShows";
import { PastShowSchema } from "../../types/shared";
import Image from "next/image";
import { useState } from "react";
import LoadMore from "../../components/loadMore";
export default function AllShows({
  genres,
  pastShows: fallbackData,
}: {
  genres: string[];
  pastShows: PastShowSchema[];
}) {
  const { filter, filterSet } = useGenreFilter();

  const { shows, loadMore, isReachingEnd, isValidating, isLoading, isError } =
    useRadioShows(fallbackData, filter);

  return (
    <section>
      <div className="pt-16 -mt-16" id="shows" aria-hidden />

      <div className="p-4 sm:p-8">
        <div className="md:flex justify-between">
          <Pill>
            <h2> {filter.length > 0 ? filter : "All"} Shows</h2>
          </Pill>
          <div className="h-5 md:hidden" />
          <GenresList genres={genres} filter={filter} filterSet={filterSet} />
        </div>

        <div className="h-5 sm:h-8" />

        {isLoading && (
          <span className="block mx-auto h-96 mt-24 text-center animate-pulse font-medium text-base">
            Loading...
          </span>
        )}

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 sm:gap-8">
          {shows.map((show, i) => (
            <li key={i}>
              <ShowPreview {...show} />
            </li>
          ))}
        </ul>

        {!isReachingEnd && !isLoading && (
          <div className="flex justify-center mt-10 sm:mt-8">
            <button
              onClick={loadMore}
              disabled={isValidating}
              className="inline-flex focus:outline-none rounded-full items-center justify-center group"
              aria-label="Load more shows"
            >
              <LoadMore loading={isValidating} />
              <span
                className="absolute rounded-full h-20 w-20 group-focus-visible:ring-4"
                aria-hidden
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
