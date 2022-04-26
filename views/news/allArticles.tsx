import ArticlePreview from "../../components/articlePreview";
import useNewsArticles from "../../hooks/useNewsArticles";
import { ArticleInterface } from "../../types/shared";

export default function AllArticles({
  articles: fallbackData,
}: {
  articles: ArticleInterface[];
}) {
  const { articles, loadMore, isReachingEnd } = useNewsArticles(fallbackData);

  return (
    <section>
      <div className="p-4 sm:p-8">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
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
              <img src="/images/load-more-button.svg" alt="" aria-hidden />

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
