import GenresList from "../../components/genresList";
import Pill from "../../components/pill";
import ShowPreview from "../../components/showPreview";
import useGenreFilter from "../../hooks/useGenreFilter";
import useRadioShows from "../../hooks/useRadioShows";
import { PastShowSchema } from "../../lib/contentful/client";
import Image from "next/image";
import Badge from "../../components/badge";
import Link from "next/link";
export default function AllShows({
  genres,
  pastShows: fallbackData,
}: {
  genres: string[];
  pastShows: PastShowSchema[];
}) {
  const { filter, filterSet } = useGenreFilter();

  const { shows, loadMore, isRefreshing, isReachingEnd } = useRadioShows(
    fallbackData,
    filter
  );

  return (
    <section>
      <div className="pt-16 -mt-16" id="shows" aria-hidden />

      <div className="p-4 pb-2 sm:p-8 sm:pb-6">
        <Pill>
          <h2>Explore</h2>
        </Pill>

        <div className="h-4" />

        <div className="md:flex justify-between items-end">
          <ul className="w-full flex flex-wrap leading-none gap-2">
            <Link href="/radio">
              <Badge invert text={"Shows"} />
            </Link>
            <Link href="/radio">
              <Badge text={"Residents"} />
            </Link>
            <Link href="/radio">
              <Badge text={"Guests"} />
            </Link>
            <Link href="/radio">
              <Badge text={"Collections"} />
            </Link>
          </ul>

          <GenresList genres={genres} filter={filter} filterSet={filterSet} />
        </div>
      </div>

      <div className="h-8  border-t-2 border-black" />
      <div className="p-4 pt-0 sm:p-8 sm:pt-0">
        {isRefreshing && (
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

        {!isReachingEnd && !isRefreshing && (
          <div className="flex justify-center mt-10 sm:mt-8">
            <button
              onClick={loadMore}
              className="inline-flex focus:outline-none rounded-full items-center justify-center group"
              aria-label="Load more shows"
            >
              <Image
                src="/images/load-more-button.svg"
                unoptimized
                aria-hidden
                width={128}
                height={128}
                priority
                alt=""
              />

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
