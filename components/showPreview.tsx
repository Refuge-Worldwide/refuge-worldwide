import Image from "next/image";
import Link from "next/link";
import PlayLarge from "../icons/playLarge";
import { contentful } from "../lib/loaders";
import { playerWidget, showKey } from "../lib/mixcloud";
import type { ShowInterface } from "../types/shared";
import { getMixcloudKey, sort } from "../util";
import Badge from "./badge";
import Date from "./date";

export default function ShowPreview({
  slug,
  title,
  coverImage,
  genresCollection,
  date,
  mixcloudLink,
}: ShowInterface) {
  const genres = genresCollection.items
    .filter((genre) => Boolean(genre?.name))
    .map((genre) => genre.name)
    .sort(sort.alpha)
    .slice(0, 3);

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
    <article className="text-small">
      <button onClick={handlePlayShow} className="flex relative group">
        <Image
          key={coverImage.sys.id}
          src={coverImage.url}
          loader={contentful}
          width={590}
          height={345}
          objectFit="cover"
          objectPosition="center"
          alt={title}
          className="bg-black bg-opacity-10"
        />
        <div className="inset-0 absolute bg-black bg-opacity-0 transition-colors duration-150 group-hover:bg-opacity-60 flex items-center justify-center text-white text-opacity-0 group-hover:text-opacity-100">
          <div className="-mr-4">
            <PlayLarge />
          </div>
        </div>
      </button>

      <div className="h-2" />

      <Link href={`/radio/${slug}`}>
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
