import Image from "next/image";
import Link from "next/link";
import loaders from "../lib/loaders";
import { ArticleInterface } from "../types/shared";
import Badge from "./badge";
import Date from "./date";

export default function RelatedArticlePreview({
  slug,
  title,
  coverImage,
  date,
  articleType,
}: ArticleInterface) {
  return (
    <Link href={`/news/${slug}`} prefetch={false}>
      <article className="text-small text-white">
        <div className="flex">
          <Image
            src={coverImage.url}
            loader={loaders.contentful}
            className="object-cover object-center aspect-video"
            width={590}
            height={345}
            alt={title}
          />
        </div>

        <div className="h-5" />

        <p className="font-medium">
          <Date dateString={date} />
        </p>

        <h2 className="font-sans font-medium truncate">{title}</h2>

        <div className="h-3" />

        <ul className="flex flex-wrap gap-2">
          <li>
            <Badge invert text={articleType} />
          </li>
        </ul>
      </article>
    </Link>
  );
}
