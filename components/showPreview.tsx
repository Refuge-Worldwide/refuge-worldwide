import Image from "next/image";
import Link from "next/link";
import type { ShowInterface } from "../types/shared";
import { formatArtistNames } from "../util";
import Badge from "./badge";

export default function ShowPreview({
  slug,
  title,
  coverImage,
  artistsCollection,
  genresCollection,
}: ShowInterface) {
  const genres = genresCollection.items;
  const artists = formatArtistNames(artistsCollection.items);

  return (
    <Link href={`/radio/${slug}`}>
      <a>
        <article className="text-small">
          <div className="flex">
            <Image
              key={slug}
              src={coverImage.url}
              width={340}
              height={190}
              objectFit="cover"
              objectPosition="center"
              alt={title}
            />
          </div>

          <div className="h-2" />

          <h2 className="font-sans font-medium truncate">{title}</h2>

          <p className="truncate">{artists}</p>

          <div className="h-2" />

          <ul className="w-full flex flex-wrap leading-none -mr-2 -mb-2">
            {genres.map((genre, i) => (
              <li key={i} className="inline-flex pr-2 pb-2">
                <Badge text={genre.name} />
              </li>
            ))}
          </ul>
        </article>
      </a>
    </Link>
  );
}
