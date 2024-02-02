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
  title: string;
};

function CollectionImageWithPlayer({
  shows,
  src,
  alt,
  title,
}: {
  title: string;
  src: string;
  alt: string;
  shows?: any;
}) {
  const showUrlSet = useGlobalStore((state) => state.showUrlSet);

  const onClick = () => {
    console.log(shows[Math.floor(Math.random() * shows.length)].mixcloudLink);
    showUrlSet(shows[Math.floor(Math.random() * shows.length)].mixcloudLink);
  };

  return (
    <button
      onClick={onClick}
      className="flex relative group"
      aria-label={`Play '${title}'`}
    >
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

export default function CollectionPreview({
  slug,
  title,
  image,
  description,
  shows,
  className = "",
}: {
  slug: string;
  title: string;
  image: {
    url: string;
  };
  description: string;
  shows?: any;
} & { className?: string }) {
  const cachedClassNames = classNames("text-small", className);

  return (
    <article className={cachedClassNames}>
      <CollectionImageWithPlayer
        src={image.url}
        alt={title}
        shows={shows.items}
        title={title}
      />

      <div className="h-2" />

      <Link
        href={`/radio/collections/${slug}`}
        prefetch={false}
        aria-labelledby={`show-${slug}`}
      >
        <h2 id={`show-${slug}`} className="font-sans font-medium">
          {title}
        </h2>
        <p>{description}</p>
      </Link>
    </article>
  );
}
