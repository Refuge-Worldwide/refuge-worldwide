import Image from "next/image";
import Link from "next/link";
import loaders from "../lib/loaders";
import { ShowInterface } from "../types/shared";
import { parseGenres } from "../util";
import Badge from "./badge";
import Date from "./date";

export default function RelatedShowPreview({
  slug,
  title,
  coverImage,
  date,
  genresCollection,
}: ShowInterface) {
  const genres = parseGenres(genresCollection).slice(0, 2);

  return (
    <Link href={`/radio/${slug}`}>
      <a>
        <article className="text-small text-white">
          <div className="flex">
            <Image
              key={coverImage.sys.id}
              src={coverImage.url}
              loader={loaders.contentful}
              width={590}
              height={345}
              objectFit="cover"
              objectPosition="center"
              alt={title}
            />
          </div>

          <div className="h-6" />

          <h2 className="font-sans font-medium truncate">{title}</h2>

          <p>
            <Date dateString={date} />
          </p>

          <div className="h-2" />

          <ul className="flex flex-wrap -mr-2 -mb-2">
            {genres.map((genre, i) => (
              <li key={i} className="pr-2 pb-2">
                <Badge invert text={genre} />
              </li>
            ))}
          </ul>
        </article>
      </a>
    </Link>
  );
}
