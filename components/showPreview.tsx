import Image from "next/image";
import Link from "next/link";
import type { ShowInterface } from "../types/shared";
import { formatArtistNames } from "../util";
import Genre from "./genre";

export default function ShowPreview({
  slug,
  title,
  coverImage,
  artistsCollection,
  genresCollection,
}: ShowInterface) {
  const genres = genresCollection.items.slice(0, 2);
  const artists = formatArtistNames(artistsCollection.items);

  return (
    <Link href={`/radio/${slug}`}>
      <a>
        <article>
          <Image
            src={coverImage.url}
            width={340}
            height={190}
            className="object-cover object-center"
            alt={title}
          />

          <h2>{title}</h2>

          <p>{artists}</p>

          <ul className="flex">
            {genres.map((genre, i) => (
              <li key={i}>
                <Genre name={genre.name} />
              </li>
            ))}
          </ul>
        </article>
      </a>
    </Link>
  );
}
