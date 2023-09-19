import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useGlobalStore } from "../hooks/useStore";
import PlayLarge from "../icons/playLarge";
import { PastShowSchema } from "../types/shared";
import loaders from "../lib/loaders";
import { TypeShow } from "../types/contentful";
import type { ShowPreviewEntry, CoverImage } from "../types/shared";
import { getMixcloudKey, parseGenres } from "../util";
import Badge from "./badge";
import Date from "./date";
import PlayCircle from "../icons/playCircle";
import Play from "../icons/play";

type ShowImageWithPlayerProps = {
  mixcloudLink: string;
  src: string;
  alt: string;
  priority?: boolean;
};

function ShowImageWithPlayer({
  mixcloudLink,
  src,
  alt,
  priority,
}: ShowImageWithPlayerProps) {
  const showUrlSet = useGlobalStore((state) => state.showUrlSet);

  const onClick = () => showUrlSet(mixcloudLink);

  return (
    <button onClick={onClick} className="flex relative group">
      <Image
        src={src}
        loader={loaders.contentful}
        width={590}
        height={332}
        alt={alt}
        className="bg-black/10 object-cover object-center aspect-video"
        priority={priority}
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

      <Link
        href={`/radio/${slug}`}
        prefetch={false}
        aria-labelledby={`show-${slug}`}
      >
        <h2 id={`show-${slug}`} className="font-sans font-medium">
          {title}
        </h2>

        <p>
          <Date dateString={date} />
        </p>

        <div className="h-2" />

        <ul className="w-full flex flex-wrap gap-2">
          {genres.map((genre, i) => (
            <li key={i}>
              <Badge invert={className == "text-white"} small text={genre} />
            </li>
          ))}
        </ul>
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
    <Link href={`/radio/${slug}`} aria-labelledby={`show-${slug}`}>
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

        <h2 id={`show-${slug}`} className="font-sans font-medium">
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
  priority,
}: ShowPreviewProps & { className?: string; priority?: boolean }) {
  const cachedClassNames = classNames("text-small", className);

  const genres = parseGenres(genresCollection);

  return (
    <article className={cachedClassNames}>
      <ShowImageWithPlayer
        src={coverImage.url}
        alt={title}
        mixcloudLink={mixcloudLink}
        priority={priority}
      />

      <div className="h-2" />

      <Link
        href={`/radio/${slug}`}
        prefetch={false}
        aria-labelledby={`show-${slug}`}
      >
        <h2 id={`show-${slug}`} className="font-sans font-medium">
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
      </Link>
    </article>
  );
}

type ArticlePreviewProps = {
  date: string;
  id: string;
  title: string;
  slug: string;
  coverImage: CoverImage;
  mixcloudLink: string;
  className?: string;
};

export function ArticleShowPreview({
  slug,
  title,
  coverImage,
  date,
  mixcloudLink,
  className = "",
}: ArticlePreviewProps) {
  const cachedClassNames = classNames(
    "sm:grid grid-cols-12 items-center justify-between gap-4 sm:gap-8 border border-black not-prose",
    className
  );

  const showKeySet = useGlobalStore((state) => state.showKeySet);

  const onClick = () => showKeySet(getMixcloudKey(mixcloudLink));

  return (
    <div className={cachedClassNames}>
      <Image
        src={coverImage.url}
        loader={loaders.contentful}
        width={266}
        height={150}
        alt={title}
        className="sm:col-span-4 sm:order-last bg-black/10 object-cover object-center aspect-video h-full w-full"
      />
      <div className="sm:col-span-8 sm:order-first flex items-center pl-4 pt-4 pb-4 sm:pl-8 sm:pt-8 sm:pb-8 gap-4 sm:gap-8">
        <div className="flex">
          {mixcloudLink && (
            <button
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full focus:outline-none focus:ring-4"
              onClick={onClick}
            >
              <PlayCircle />
            </button>
          )}
        </div>

        <Link
          href={`/radio/${slug}`}
          prefetch={false}
          aria-labelledby={`show-${slug}`}
        >
          <p id={`show-${slug}`} className="font-sans font-medium ">
            {title}
          </p>
          <Date dateString={date} />
        </Link>
      </div>
    </div>
  );
}
