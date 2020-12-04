import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Link from "next/link";
import { Arrow } from "../icons/arrow";
import { ArticleInterface } from "../types/shared";
import Badge from "./badge";
import Date from "./date";
import Pill from "./pill";

export default function FeaturedArticlePreview({
  title,
  subtitle,
  date,
  slug,
  content,
  articleType,
}: ArticleInterface) {
  return (
    <article className="bg-green">
      <header className="border-2">
        <Pill>
          <span className="font-serif">Featured</span>
        </Pill>

        <p className="font-medium">
          <Date dateString={date} />
        </p>

        <h1 className="text-large">{title}</h1>

        <p className="font-medium">{subtitle}</p>

        <Badge text={articleType} />

        <div>
          {documentToReactComponents({
            ...content.json,
            content: content.json.content.slice(0, 1),
          })}
        </div>

        <Link href={`/news/${slug}`}>
          <a className="inline-flex items-center space-x-5 font-medium leading-none">
            <span className="underline">Read more</span>
            <Arrow />
          </a>
        </Link>
      </header>
      <main className="border-2 bg-white">IMAGE HERE</main>
    </article>
  );
}
