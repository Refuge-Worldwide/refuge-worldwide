import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Arrow } from "../icons/arrow";
import { ArticleInterface } from "../types/shared";
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
  return (
    <Link href={`/news/${slug}`}>
      <a>
        <article className="text-small font-medium leading-snug">
          <Image
            key={slug}
            src={coverImage.url}
            width={590}
            height={345}
            objectFit="cover"
            objectPosition="center"
            alt={title}
          />

          <div className="h-4" />

          <p>
            <Date dateString={date} formatString={"DD.MM.YYYY"} />
          </p>

          <h2 className="font-sans">{title}</h2>

          {withType ? (
            <Fragment>
              <div className="h-2" />

              <Badge text={articleType} />

              <div className="h-2" />
            </Fragment>
          ) : (
            <div className="h-4" />
          )}

          <div className="font-light">
            {documentToReactComponents({
              ...content.json,
              content: content.json.content.slice(0, 1),
            })}
          </div>

          <div className="h-4" />

          <p className="inline-flex items-center space-x-5">
            <span className="underline">Read more</span>
            <Arrow />
          </p>
        </article>
      </a>
    </Link>
  );
}
