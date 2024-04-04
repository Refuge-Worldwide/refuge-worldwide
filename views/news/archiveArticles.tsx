import ArticlePreview from "../../components/articlePreview";
import useNewsArchiveArticles from "../../hooks/useNewsArchiveArticles";
import { ArticleInterface } from "../../types/shared";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function ArchiveArticles({
  articles: fallbackData,
  type,
}: {
  articles: ArticleInterface[];
  type: string;
}) {
  const { articles, loadMore, isReachingEnd } = useNewsArchiveArticles(
    fallbackData,
    type
  );

  return (
    <section>
      <div className="p-4 sm:p-8">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10 gap-y-12">
          {articles.map((article, i) => (
            <li key={i}>
              <ArticlePreview withType {...article} />
            </li>
          ))}
        </ul>

        {!isReachingEnd && (
          <div className="flex justify-center mt-10 sm:mt-8">
            <button
              onClick={loadMore}
              className="inline-flex focus:outline-none rounded-full items-center justify-center group"
              aria-label="Load more shows"
            >
              <Image
                src="/images/load-more-button.svg"
                unoptimized
                aria-hidden
                width={128}
                height={128}
                priority
                alt=""
              />

              <span
                className="absolute rounded-full h-20 w-20 group-focus:ring-4"
                aria-hidden
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
