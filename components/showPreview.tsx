import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import PlayLarge from "../icons/playLarge";
import { PastShowSchema } from "../lib/contentful/client";
import loaders from "../lib/loaders";
import { playerWidget, showKey } from "../lib/mixcloud";
import type { ShowPreviewEntry } from "../types/shared";
import { getMixcloudKey, parseGenres } from "../util";
import Badge from "./badge";
import Date from "./date";

type ShowPreviewProps = ShowPreviewEntry & { className?: string };

export default function ShowPreview({
  slug,
  title,
  coverImage,
  genres,
  date,
  mixcloudLink,
  className = "",
}: PastShowSchema & { className?: string }) {
  const cachedClassNames = classNames("text-small", className);

  const [, setKey] = showKey.use();

  const player = playerWidget.useValue();

  const handlePlayShow = async () => {
    setKey(getMixcloudKey(mixcloudLink));

    if (player?.play) {
      console.log("[Mixcloud]", "Play");

      try {
        await player.togglePlay();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <article className={cachedClassNames}>
      <button onClick={handlePlayShow} className="flex relative group">
        <Image
          key={slug}
          src={coverImage}
          loader={loaders.contentful}
          width={590}
          height={345}
          objectFit="cover"
          objectPosition="center"
          alt={title}
          className="bg-black/10"
        />
        <div className="inset-0 absolute bg-black/0 transition-colors duration-150 group-hover:bg-black/60 flex items-center justify-center text-white/10 group-hover:text-white/100">
          <div className="-mr-4">
            <PlayLarge />
          </div>
        </div>
      </button>

      <div className="h-2" />

      <Link href={`/radio/${slug}`} prefetch={false}>
        <a aria-labelledby={`show-${slug}`}>
          <h2 id={`show-${slug}`} className="font-sans font-medium truncate">
            {title}
          </h2>

          <p>
            <Date dateString={date} />
          </p>

          <div className="h-2" />

          <ul className="w-full flex flex-wrap -mr-2 -mb-2">
            {genres.map((genre, i) => (
              <li key={i} className="pr-2 pb-2">
                <Badge small text={genre} />
              </li>
            ))}
          </ul>
        </a>
      </Link>
    </article>
  );
}

export function ShowPreviewWithoutPlayer({
  slug,
  title,
  coverImage,
  genresCollection,
  date,
  className = "",
}: ShowPreviewProps) {
  const cachedClassNames = classNames("text-small", className);

  const genres = parseGenres(genresCollection).slice(0, 3);

  return (
    <Link href={`/radio/${slug}`}>
      <a aria-labelledby={`show-${slug}`}>
        <article className={cachedClassNames}>
          <div className="flex">
            <Image
              key={coverImage.sys.id}
              src={coverImage.url}
              loader={loaders.contentful}
              width={590}
              height={345}
              objectFit="cover"
              objectPosition="center"
              alt={title}
              className="bg-black/10"
            />
          </div>

          <div className="h-2" />

          <h2 id={`show-${slug}`} className="font-sans font-medium truncate">
            {title}
          </h2>

          <p>
            <Date dateString={date} />
          </p>

          <div className="h-2" />

          <ul className="w-full flex flex-wrap -mr-2 -mb-2">
            {genres.map((genre, i) => (
              <li key={i} className="pr-2 pb-2">
                <Badge small text={genre} />
              </li>
            ))}
          </ul>
        </article>
      </a>
    </Link>
  );
}

export function FeaturedShowPreview({
  slug,
  title,
  coverImage,
  genresCollection,
  date,
  mixcloudLink,
  className = "",
}: ShowPreviewProps & { className?: string }) {
  const cachedClassNames = classNames("text-small", className);

  const genres = parseGenres(genresCollection);

  const [, setKey] = showKey.use();

  const player = playerWidget.useValue();

  const handlePlayShow = async () => {
    setKey(getMixcloudKey(mixcloudLink));

    if (player?.play) {
      console.log("[Mixcloud]", "Play");

      try {
        await player.togglePlay();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <article className={cachedClassNames}>
      <button onClick={handlePlayShow} className="flex relative group">
        <Image
          key={coverImage.sys.id}
          src={coverImage.url}
          loader={loaders.contentful}
          width={590}
          height={345}
          objectFit="cover"
          objectPosition="center"
          alt={title}
          className="bg-black/10"
        />
        <div className="inset-0 absolute bg-black/0 transition-colors duration-150 group-hover:bg-black/60 flex items-center justify-center text-white/0 group-hover:text-white/100">
          <div className="-mr-4">
            <PlayLarge />
          </div>
        </div>
      </button>

      <div className="h-2" />

      <Link href={`/radio/${slug}`} prefetch={false}>
        <a aria-labelledby={`show-${slug}`}>
          <h2 id={`show-${slug}`} className="font-sans font-medium truncate">
            {title}
          </h2>

          <p>
            <Date dateString={date} />
          </p>

          <div className="h-2" />

          <ul className="w-full flex flex-wrap -mr-2 -mb-2">
            {genres.map((genre, i) => (
              <li key={i} className="pr-2 pb-2">
                <Badge small text={genre} />
              </li>
            ))}
          </ul>
        </a>
      </Link>
    </article>
  );
}
