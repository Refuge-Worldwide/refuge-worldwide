import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Fragment } from "react";
import Badge from "../../components/badge";
import Date from "../../components/date";
import Pill from "../../components/pill";
import Prose from "../../components/Prose";
import { useGlobalStore } from "../../hooks/useStore";
import PlayCircle from "../../icons/playCircle";
import { ShowInterface } from "../../types/shared";
import { parseGenres } from "../../util";

const ShareButton = dynamic(() => import("../../components/shareButton"));

export default function ShowBody({
  title,
  genresCollection,
  artistsCollection,
  slug,
  date,
  content,
  mixcloudLink,
}: ShowInterface) {
  const genres = parseGenres(genresCollection);

  const artists = artistsCollection.items.filter((artist) => artist !== null);

  const persons = (
    <Fragment>
      {artists?.map((artist, i) => {
        const isLast = artists.length === i + 1;
        const isSecondLast = artists.length === i + 2;

        const a = (
          <Link key={i} href={`/artists/${artist.slug}`} className="underline">
            {artist.name}
          </Link>
        );

        if (artists.length === 1) return a;

        if (isLast) return <Fragment key={i}>and {a}</Fragment>;

        if (isSecondLast) return <Fragment key={i}>{a} </Fragment>;

        return <Fragment key={i}>{a}, </Fragment>;
      })}
    </Fragment>
  );

  const showUrlSet = useGlobalStore((state) => state.showUrlSet);

  const onClick = () => showUrlSet(mixcloudLink);

  return (
    <Fragment>
      <section>
        <div className="container-md p-4 sm:p-8 bg-white">
          <div className="flex flex-wrap md:flex-nowrap md:space-x-8 lg:space-x-12 justify-between">
            <div className="flex">
              {mixcloudLink && (
                <button
                  className="w-20 h-20 sm:w-28 sm:h-28 rounded-full focus:outline-none focus:ring-4"
                  onClick={onClick}
                  aria-label={`Play '${title}'`}
                >
                  <PlayCircle />
                </button>
              )}
            </div>

            <div className="w-full order-last md:order-none">
              <div className="h-3 block md:hidden" />

              <p className="text-small text-center">
                {date && <Date dateString={date} />}
              </p>

              <div className="h-6" />

              <h1 className="text-base sm:text-large text-center">{title}</h1>

              <div className="h-6" />

              {genres.length > 0 && (
                <ul className="w-full flex flex-wrap justify-center gap-2">
                  {genres.map((genre, i) => (
                    <li className="cursor-pointer" key={i}>
                      <Link
                        href={`/radio?genre=${encodeURIComponent(genre)}#shows`}
                        legacyBehavior
                      >
                        <Badge as="a" text={genre} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="h-6" />

              {artists.length > 0 && (
                <p className="font-medium text-center">With {persons}</p>
              )}
            </div>

            <div className="flex">
              <ShareButton
                details={{
                  title: title,
                  slug: `/radio/${slug}`,
                }}
              />
            </div>
          </div>

          <div className="h-6" />

          {content && <Prose>{documentToReactComponents(content?.json)}</Prose>}
        </div>
      </section>
    </Fragment>
  );
}
