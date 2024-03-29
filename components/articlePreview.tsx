import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Arrow } from "../icons/arrow";
import loaders from "../lib/loaders";
import { TypeArticle } from "../types/contentful";
import type { ArticleInterface } from "../types/shared";
import Badge from "./badge";
import Date from "./date";

interface ArticlePreview extends ArticleInterface {
  withType?: boolean;
}

export default function ArticlePreview({
  slug,
  title,
  date,
  articleType,
  withType,
  coverImage,
  subtitle,
  content,
}: ArticlePreview) {
  return (
    <Link href={`/news/${slug}`} aria-labelledby={`article-${slug}`}>
      <article className="text-small leading-snug">
        <div className="flex relative">
          <Image
            key={coverImage.sys.id}
            src={coverImage.url}
            loader={loaders.contentful}
            width={590}
            height={369}
            alt={coverImage.description ? coverImage.description : title}
            className="bg-black/10 object-cover object-center aspect-[16/10]"
          />
          {withType ? (
            <Fragment>
              <div className="flex absolute bottom-4 left-4">
                <Badge invert={true} text={articleType} />
              </div>
            </Fragment>
          ) : (
            <div className="hidden sm:block h-4" />
          )}
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
    </Link>
  );
}

export function ArticlePreviewForSearch({
  fields: { slug, coverImage, title, date, articleType },
}: TypeArticle) {
  return (
    <Link href={`/news/${slug}`} aria-labelledby={`article-${slug}`}>
      <article className="text-small font-medium leading-snug">
        <div className="flex">
          <Image
            key={coverImage.sys.id}
            src={coverImage.fields.file.url}
            loader={loaders.contentful}
            width={590}
            height={335}
            alt={title}
            className="bg-black/10 object-cover object-center aspect-video"
          />
        </div>

        <div className="h-2" />

        <p>
          <Date dateString={date} formatString={"DD.MM.YYYY"} />
        </p>

        <h2 id={`article-${slug}`} className="font-sans leading-none">
          {title}
        </h2>

        <div className="h-2" />

        <ul className="flex flex-wrap">
          <li>
            <Badge text={articleType} />
          </li>
        </ul>
      </article>
    </Link>
  );
}
