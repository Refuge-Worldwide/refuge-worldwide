import ArticlePreview from "../../components/articlePreview";
import { ArticleInterface } from "../../types/shared";

export default function AllArticles({
  articles,
}: {
  articles: ArticleInterface[];
}) {
  return (
    <section className="p-8">
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {articles?.map((article, i) => (
          <li key={i}>
            <ArticlePreview withType {...article} />
          </li>
        ))}
      </ul>
    </section>
  );
}
