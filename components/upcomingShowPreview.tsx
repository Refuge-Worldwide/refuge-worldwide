import Image from "next/image";
import { ShowInterface } from "../types/shared";
import { formatArtistNames } from "../util";
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
  const genres = genresCollection.items;
  const artists = formatArtistNames(artistsCollection.items);

  return (
    <article>
      <div className="flex">
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

      <div className="h-5" />

      <div className="flex">
        <Pill small>
          <span className="font-serif text-small">
            <Date dateString={date} formatString="MMMM DD" />
          </span>
        </Pill>
      </div>

      <div className="h-2" />

      <h2 className="text-base sm:text-large">{title}</h2>

      <div className="h-2" />

      <p>{artists}</p>

      <div className="h-3" />

      <ul className="flex flex-wrap -mr-2 -mb-2">
        {genres.slice(0, 3).map((genre, i) => (
          <li key={i} className="pr-2 pb-2">
            <Badge text={genre.name} />
          </li>
        ))}
      </ul>
    </article>
  );
}
