import Link from "next/link";
import ArticlePreview from "../../components/articlePreview";
import Pill from "../../components/pill";
import { Arrow } from "../../icons/arrow";
import { ArticleInterface } from "../../types/shared";
import { useState } from "react";

export default function LatestNews({
  articles,
}: {
  articles: ArticleInterface[];
}) {
  const [icymi, setIcymi] = useState(false);
  const [bs, setBs] = useState(false);

  return (
    <section>
      <div className="p-4 sm:p-8">
        <Pill>
          <h2>News</h2>
        </Pill>

        <div className="h-5 sm:h-8" />

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {articles.map((article, idx) => {
            const greaterThanFour = idx >= 4;

            return (
              <li className={greaterThanFour ? "xl:hidden" : ""} key={idx}>
                <ArticlePreview {...article} />
              </li>
            );
          })}
        </ul>

        <div className="h-10 sm:h-16" />

        <div className="text-center">
          <Link
            href="/news"
            className="inline-flex items-center space-x-4 text-base font-medium"
          >
            <span className="underline">All News</span>
            <Arrow />
          </Link>
        </div>
      </div>

      <div className="h-10" />
    </section>
  );
}
