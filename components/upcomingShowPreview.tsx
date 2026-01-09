import Image from "next/image";
import Link from "next/link";
import { UpcomingShowType } from "../lib/contentful/pages/radio";
import loaders from "../lib/loaders";
import { parseGenres } from "../util";
import Badge from "./badge";
import Date from "./date";

export default function UpcomingShowPreview({
  coverImage,
  title,
  slug,
  genresCollection,
  date,
}: UpcomingShowType) {
  const genres = parseGenres(genresCollection);

  // remove artists from title
  const upcomingShowTitle = title.split(" | ")[0];

  return (
    <Link href={`/radio/${slug}`} aria-labelledby={`upcoming-${slug}`}>
      <article className="text-small">
        <div className="flex">
          <Image
            key={coverImage.sys.id}
            src={coverImage.url}
            loader={loaders.contentful}
            width={590}
            height={332}
            alt={title}
            className="bg-black/10 object-cover object-center aspect-video"
          />
        </div>

        <div className="h-2" />

        <h2 id={`upcoming-${slug}`} className="font-sans font-medium">
          {upcomingShowTitle}
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
      </article>
    </Link>
  );
}
