import ArticlePreview from "../../components/articlePreview";
import useNewsArticles from "../../hooks/useNewsArticles";
import { ArticleInterface } from "../../types/shared";
import Image from "next/image";
import { useState, useEffect } from "react";
import LoadMore from "../../components/loadMore";

export default function AllArticles({
  articles: fallbackData,
}: {
  articles: ArticleInterface[];
}) {
  const { articles, loadMore, isReachingEnd, isValidating } =
    useNewsArticles(fallbackData);

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
              disabled={isValidating}
              className="inline-flex focus:outline-none rounded-full items-center justify-center group"
              aria-label="Load more shows"
            >
              <LoadMore loading={isValidating} />
              <span
                className="absolute rounded-full h-20 w-20 group-focus-visible:ring-4"
                aria-hidden
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
