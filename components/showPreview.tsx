import Image from "next/image";
import Link from "next/link";
import type { ShowInterface } from "../types/shared";
import { formatArtistNames, sort } from "../util";
import Badge from "./badge";
import Date from "./date";

export default function ShowPreview({
  slug,
  title,
  coverImage,
  artistsCollection,
  genresCollection,
  date,
}: ShowInterface) {
  const genres = genresCollection.items
    .map((genre) => genre.name)
    .sort(sort.alpha)
    .slice(0, 2);

  const artists = formatArtistNames(artistsCollection.items);

  return (
    <Link href={`/radio/${slug}`}>
      <a>
        <article className="text-small show-preview">
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

          <p>
            <Date dateString={date} formatString="MMMM DD, YYYY" />
          </p>

          <div className="h-2" />

          <ul className="flex flex-wrap -mr-2 -mb-2">
            {genres.map((genre, i) => (
              <li key={i} className="pr-2 pb-2">
                <Badge text={genre} />
              </li>
            ))}
          </ul>
        </article>
      </a>
    </Link>
  );
}
