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
  subtitle,
}: ArticleInterface) {
  return (
    <Link href={`/news/${slug}`} prefetch={false}>
      {/* <article className="text-small text-white">
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
      </article> */}
      <article className="text-small leading-snug text-white">
        <div className="flex relative">
          <Image
            key={coverImage.sys.id}
            src={coverImage.url}
            loader={loaders.contentful}
            width={590}
            height={369}
            alt={title}
            className="bg-black/10 object-cover object-center aspect-[16/10] w-full"
          />
          <div className="flex absolute bottom-4 left-4">
            <Badge invert={true} text={articleType} />
          </div>
        </div>

        <div className="h-3" />
        <div className="md:flex space-x-2 items-center">
          <p className="text-small">
            <Date dateString={date} />
          </p>
        </div>
        <div className="h-1" />

        <h2 id={`article-${slug}`} className="font-sans font-medium">
          {title}
        </h2>

        <p className="font-light">{subtitle}</p>
      </article>
      ;
    </Link>
  );
}
