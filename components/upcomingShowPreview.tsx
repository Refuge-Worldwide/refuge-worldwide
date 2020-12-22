import Image from "next/image";
import Link from "next/link";
import { ShowInterface } from "../types/shared";
import { formatArtistNames, sort } from "../util";
import Badge from "./badge";
import Date from "./date";
import Pill from "./pill";

export default function UpcomingShowPreview({
  coverImage,
  title,
  artistsCollection,
  slug,
  genresCollection,
  date,
}: ShowInterface) {
  const genres = genresCollection.items
    .map((genre) => genre.name)
    .sort(sort.alpha)
    .slice(0, 3);

  const artists = formatArtistNames(artistsCollection.items);

  return (
    <Link href={`/radio/${slug}`}>
      <a aria-labelledby={slug}>
        <article>
          <div className="flex w-full">
            <Image
              key={slug}
              src={coverImage.url}
              width={590}
              height={345}
              objectFit="cover"
              objectPosition="center"
              alt={title}
            />
          </div>

          <div className="h-4" />

          <div className="flex">
            <Pill size="small">
              <span className="font-serif text-tiny sm:text-small">
                <Date dateString={date} formatString="MMMM DD" />
              </span>
            </Pill>
          </div>

          <div className="h-2" />

          <h2 id={slug} className="text-base sm:text-large">
            {title}
          </h2>

          <div className="h-2" />

          <p>{artists}</p>

          <div className="h-3" />

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
