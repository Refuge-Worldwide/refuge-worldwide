import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Arrow } from "../icons/arrow";
import { ArticleInterface, ArticleType } from "../types/shared";
import Badge from "./badge";
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
  const articleClassName = getArticleBackgroundColor(articleType);

  return (
    <article className={"md:grid grid-cols-10 h-full " + articleClassName}>
      <header className="col-span-5 2xl:col-span-3 px-4 py-6 lg:px-8 lg:py-12 border-l-2 border-t-2 border-b-2 ">
        <Pill>
          <span className="font-serif">{articleType}</span>
        </Pill>

        <div className="h-6" />

        <p className="font-medium">
          <Date dateString={date} formatString="MMMM DD, YYYY" />
        </p>

        <div className="h-2" />

        <h1 className="text-large">{title}</h1>

        <div className="h-4" />

        <p className="font-medium">{subtitle}</p>

        <div className="h-6" />

        <Link href={`/news/${slug}`}>
          <a className="inline-flex items-center space-x-5 font-medium leading-none focus:outline-none">
            <span className="underline">Read more</span>
            <Arrow />
          </a>
        </Link>

        <div className="h-8" />
      </header>

      <div className="col-span-5 2xl:col-span-7 relative border-l-2 border-t-2 border-b-2 ">
        <Image
          src={coverImage.url}
          objectFit="cover"
          objectPosition="center"
          layout="fill"
        />
      </div>
    </article>
  );
}
