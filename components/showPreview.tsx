import classNames from "classnames";
import Image from "next/future/image";
import Link from "next/link";
import { useGlobalStore } from "../hooks/useStore";
import PlayLarge from "../icons/playLarge";
import { PastShowSchema } from "../lib/contentful/client";
import loaders from "../lib/loaders";
import { TypeShow } from "../types/contentful";
import type { ShowPreviewEntry } from "../types/shared";
import { getMixcloudKey, parseGenres } from "../util";
import Badge from "./badge";
import Date from "./date";

type ShowImageWithPlayerProps = {
  mixcloudLink: string;
  src: string;
  alt: string;
};

function ShowImageWithPlayer({
  mixcloudLink,
  src,
  alt,
}: ShowImageWithPlayerProps) {
  const showKeySet = useGlobalStore((state) => state.showKeySet);

  const onClick = () => showKeySet(getMixcloudKey(mixcloudLink));

  return (
    <button onClick={onClick} className="flex relative group">
      <Image
        src={src}
        loader={loaders.contentful}
        width={590}
        height={332}
        alt={alt}
        className="bg-black/10 object-cover object-center aspect-video"
      />

      <div className="inset-0 absolute bg-black/0 transition-colors duration-150 group-hover:bg-black/60 flex items-center justify-center text-white/0 group-hover:text-white/100">
        <div className="-mr-4">
          <PlayLarge />
        </div>
      </div>
    </button>
  );
}

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

  return (
    <article className={cachedClassNames}>
      <ShowImageWithPlayer
        src={coverImage}
        alt={title}
        mixcloudLink={mixcloudLink}
      />

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

          <ul className="w-full flex flex-wrap gap-2">
            {genres.map((genre, i) => (
              <li key={i}>
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
  fields: { genres, coverImage, title, slug, date },
}: TypeShow) {
  const parsedGenres = parseGenres({
    items: genres.map((genre) => ({
      name: genre.fields.name,
      sys: { id: genre.sys.id },
    })),
  }).slice(0, 3);

  return (
    <Link href={`/radio/${slug}`}>
      <a aria-labelledby={`show-${slug}`}>
        <article className="text-small">
          <div className="flex">
            <Image
              key={coverImage.sys.id}
              src={coverImage.fields.file.url}
              loader={loaders.contentful}
              width={590}
              height={332}
              alt={title}
              className="bg-black/10 object-cover object-center aspect-video"
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

          <ul className="w-full flex flex-wrap gap-2">
            {parsedGenres.map((genre, i) => (
              <li key={i}>
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

  return (
    <article className={cachedClassNames}>
      <ShowImageWithPlayer
        src={coverImage.url}
        alt={title}
        mixcloudLink={mixcloudLink}
      />

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

          <ul className="w-full flex flex-wrap gap-2">
            {genres.map((genre, i) => (
              <li key={i}>
                <Badge small text={genre} />
              </li>
            ))}
          </ul>
        </a>
      </Link>
    </article>
  );
}
