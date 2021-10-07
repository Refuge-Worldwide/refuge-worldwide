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

          <div className="h-5" />

          <p className="font-medium">
            <Date dateString={date} formatString={"DD.MM.YYYY"} />
          </p>

          <h2 className="font-sans font-medium truncate">{title}</h2>

          <div className="h-3" />

          <ul className="flex flex-wrap -mr-2 -mb-2">
            <li className="pr-2 pb-2">
              <Badge invert text={articleType} />
            </li>
          </ul>
        </article>
      </a>
    </Link>
  );
}
