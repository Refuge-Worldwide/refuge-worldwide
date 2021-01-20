import Pill from "../../components/pill";
import RelatedArticlePreview from "../../components/relatedArticlePreview";
import { ArticleInterface } from "../../types/shared";

export default function RelatedArticles({
  articles,
}: {
  articles: ArticleInterface[];
}) {
  return (
    <section className="border-b-2 border-white bg-black">
      <div className="p-4 sm:p-8">
        <Pill invert>
          <h2>More Stories</h2>
        </Pill>

        <div className="h-5 sm:h-8" />

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map((article, i) => (
            <li key={i}>
              <RelatedArticlePreview {...article} />
            </li>
          ))}
        </ul>

        <div className="h-10" />
      </div>
    </section>
  );
}
