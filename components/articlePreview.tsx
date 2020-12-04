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

          <p className="font-light">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque,
            et. Suscipit, veniam eligendi. Nisi, in asperiores. Esse
            necessitatibus neque ducimus id. Officia error voluptatum hic
            asperiores quam tempora ipsum mollitia?
          </p>

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
