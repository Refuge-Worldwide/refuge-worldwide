import Link from "next/link";
import ArticlePreview from "../../components/articlePreview";
import Pill from "../../components/pill";
import { Arrow } from "../../icons/arrow";
import { ArticleInterface } from "../../types/shared";

export default function LatestNews({
  articles,
}: {
  articles: ArticleInterface[];
}) {
  return (
    <section>
      <div className="px-8 pt-12 pb-20">
        <Pill>
          <h2>News</h2>
        </Pill>

        <div className="h-8" />

        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {articles.map((article, i) => (
            <li key={i}>
              <ArticlePreview {...article} />
            </li>
          ))}
        </ul>

        <div className="h-16" />

        <div className="text-center">
          <Link href="/news">
            <a className="inline-flex items-center space-x-4 font-medium">
              <span className="underline">All News</span>
              <Arrow />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
