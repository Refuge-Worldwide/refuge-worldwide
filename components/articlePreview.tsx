import {
  documentToReactComponents,
  Options,
} from "@contentful/rich-text-react-renderer";
import { Document, INLINES } from "@contentful/rich-text-types";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Arrow } from "../icons/arrow";
import loaders from "../lib/loaders";
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
  content,
}: ArticlePreview) {
  /**
   * Roundabout way to get the first line of text
   */
  const excerpt: Document = {
    ...content.json,
    content: content.json.content
      .filter((el) => el.nodeType === "paragraph")
      .slice(0, 1),
  };

  const richTextOptions: Options = {
    renderNode: {
      [INLINES.HYPERLINK]: (_, children) => children,
    },
  };

  return (
    <Link href={`/news/${slug}`}>
      <a aria-labelledby={`article-${slug}`}>
        <article className="text-small font-medium leading-snug">
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
              className="bg-black bg-opacity-10"
            />
          </div>

          <div className="h-4" />

          <p>
            <Date dateString={date} formatString={"DD.MM.YYYY"} />
          </p>

          <h2 id={`article-${slug}`} className="font-sans">
            {title}
          </h2>

          {withType ? (
            <Fragment>
              <div className="h-2" />

              <ul className="flex flex-wrap">
                <li>
                  <Badge text={articleType} />
                </li>
              </ul>

              <div className="hidden sm:block h-2" />
            </Fragment>
          ) : (
            <div className="hidden sm:block h-4" />
          )}

          <div className="hidden sm:block">
            <div className="font-light">
              {documentToReactComponents(excerpt, richTextOptions)}
            </div>

            <div className="h-4" />

            <p className="inline-flex items-center space-x-5">
              <span className="underline">Read more</span>
              <Arrow />
            </p>
          </div>
        </article>
      </a>
    </Link>
  );
}

export function ArticlePreviewForSearch({
  slug,
  title,
  date,
  articleType,
  coverImage,
}: ArticlePreview) {
  return (
    <Link href={`/news/${slug}`}>
      <a aria-labelledby={`article-${slug}`}>
        <article className="text-small font-medium leading-snug">
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
              className="bg-black bg-opacity-10"
            />
          </div>

          <div className="h-4" />

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
      </a>
    </Link>
  );
}
