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

      <div className="p-4 pb-1 sm:p-8 sm:pb-6 sm:pb-1">
        <Pill>
          <h2>Explore</h2>
        </Pill>

        {/* <div className="h-6" /> */}
      </div>

      <div className="p-4 pb-2 sm:p-8 sm:pb-6 md:flex md:sticky md:top-14 z-10 bg-white border-b-2 border-black justify-between items-center">
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

      <div className="" />
      <div className="p-4 sm:p-8">
        {isRefreshing && (
          <div className="block h-96 mt-24 text-center font-medium text-base">
            <Image
              className="mx-auto"
              src="/images/loading.gif"
              width={150}
              height={150}
              alt="Loading"
            />
          </div>
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
