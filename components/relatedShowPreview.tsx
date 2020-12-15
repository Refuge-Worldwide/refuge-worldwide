import Image from "next/image";
import Link from "next/link";
import { ShowInterface } from "../types/shared";
import { sort } from "../util";
import Badge from "./badge";
import Date from "./date";

export default function RelatedShowPreview({
  slug,
  title,
  coverImage,
  date,
  genresCollection,
}: ShowInterface) {
  const genres = genresCollection.items
    .map((genre) => genre.name)
    .sort(sort.alpha)
    .slice(0, 2);

  return (
    <Link href={`/radio/${slug}`}>
      <a>
        <article className="text-small text-white">
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

          <div className="h-6" />

          <h2 className="font-sans font-medium truncate">{title}</h2>

          <p>
            <Date dateString={date} formatString="MMMM DD, YYYY" />
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
