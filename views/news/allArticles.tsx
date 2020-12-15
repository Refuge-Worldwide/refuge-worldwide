import ArticlePreview from "../../components/articlePreview";
import { ArticleInterface } from "../../types/shared";

export default function AllArticles({
  articles,
}: {
  articles: ArticleInterface[];
}) {
  return (
    <section>
      <div className="p-4 sm:p-8">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles?.map((article, i) => (
            <li key={i}>
              <ArticlePreview withType {...article} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
