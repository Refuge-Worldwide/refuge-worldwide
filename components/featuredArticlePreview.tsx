import cn from "classnames";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "../icons/arrow";
import loaders from "../lib/loaders";
import { ArticleInterface, ArticleType } from "../types/shared";
import Date from "./date";
import Pill from "./pill";

function getArticleBackgroundColor(type: ArticleType) {
  let bg: string;

  if (type === "Project") bg = "bg-orange";
  if (type === "Blog") bg = "bg-blue";
  if (type === "News") bg = "bg-pink";
  if (type === "Event") bg = "bg-red";
  if (type === "Interview") bg = "bg-green";

  return bg;
}

export default function FeaturedArticlePreview({
  title,
  subtitle,
  date,
  slug,
  articleType,
  coverImage,
}: ArticleInterface) {
  const articleBackgroundClassName = getArticleBackgroundColor(articleType);

  const articleClassNames = cn(
    "flex flex-col-reverse md:grid grid-cols-10 h-full",
    articleBackgroundClassName
  );

  return (
    <Link href={`/news/${slug}`}>
      <a aria-labelledby={`featured-article-${slug}`}>
        <article className={articleClassNames}>
          <header className="flex-1 md:col-span-5 2xl:col-span-3 p-4 lg:p-8 border-l-2 border-t-0 md:border-t-2 border-b-2">
            <Pill>
              <span className="font-serif">{articleType}</span>
            </Pill>

            <div className="h-3 sm:h-6" />

            <p className="font-medium">
              <Date dateString={date} />
            </p>

            <div className="h-2" />

            <h1
              id={`featured-article-${slug}`}
              className="text-base sm:text-large"
            >
              {title}
            </h1>

            <div className="h-4" />

            <p className="font-medium">{subtitle}</p>

            <div className="h-6" />

            <div className="inline-flex items-center space-x-5 font-medium leading-none ">
              <span className="underline">Read more</span>
              <Arrow />
            </div>

            <div className="hidden sm:block h-6" />
          </header>

          <div className="md:col-span-5 2xl:col-span-7 h-56 md:h-auto relative border-l-2 border-t-2 border-b-2">
            <Image
              key={coverImage.sys.id}
              draggable="false"
              alt={coverImage.title}
              src={coverImage.url}
              loader={loaders.contentful}
              objectFit="cover"
              objectPosition="center"
              layout="fill"
              loading="eager"
              priority
            />
          </div>
        </article>
      </a>
    </Link>
  );
}
