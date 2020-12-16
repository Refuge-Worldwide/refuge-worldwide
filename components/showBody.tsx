import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Link from "next/link";
import { Fragment } from "react";
import useMixcloudPlayer from "../hooks/useMixcloudPlayer";
import { ShowInterface } from "../types/shared";
import { getMixcloudKey, sort } from "../util";
import Badge from "./badge";
import Date from "./date";
import Pill from "./pill";

export default function ShowBody({
  title,
  genresCollection,
  artistsCollection,
  date,
  content,
  mixcloudLink,
}: ShowInterface) {
  const genres = genresCollection.items
    .map((genre) => genre.name)
    .sort(sort.alpha);

  const artists = artistsCollection.items;

  const persons = (
    <Fragment>
      {artists?.map((artist, i) => {
        const isLast = artists.length === i + 1;

        const a = (
          <Link key={i} href={`/artists/${artist.slug}`}>
            <a className="underline">{artist.name}</a>
          </Link>
        );

        if (artists.length === 1) return a;

        if (isLast) return <Fragment>and {a}</Fragment>;

        return <Fragment>{a}, </Fragment>;
      })}
    </Fragment>
  );

  const [player] = useMixcloudPlayer();

  const handlePlayShow = () => {
    const cloudcastKey = getMixcloudKey(mixcloudLink);

    if (player) {
      player.load(cloudcastKey, true);
    }
  };

  return (
    <Fragment>
      {mixcloudLink && <button onClick={handlePlayShow}>Play</button>}

      <p className="text-small text-center">
        <Date dateString={date} />
      </p>

      <div className="h-6" />

      <h1 className="text-base sm:text-large text-center">{title}</h1>

      <div className="h-6" />

      <ul className="flex flex-wrap justify-center -mr-2 -mb-2">
        {genres.map((genre, i) => (
          <li key={i} className="pr-2 pb-2">
            <Badge text={genre} />
          </li>
        ))}
      </ul>

      <div className="h-6" />

      <p className="font-medium text-center">With {persons}</p>

      <div className="h-6" />

      <div className="p-4 sm:p-8 prose sm:prose-lg">
        {documentToReactComponents(content?.json)}
      </div>

      <div className="h-28" />

      <section className="border-t-2 pt-8 px-8 pb-14">
        <Pill>
          <span className="font-serif">Persons</span>
        </Pill>

        <div className="h-8" />

        <p className="font-medium">{persons}</p>
      </section>
    </Fragment>
  );
}
