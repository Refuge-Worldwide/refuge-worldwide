import ArticlePreview from "../../components/articlePreview";
import { ArticleInterface } from "../../types/shared";

export default function AllArticles({
  articles,
}: {
  articles: ArticleInterface[];
}) {
  return (
    <section>
      <ul className="flex">
        {articles?.map((article, i) => (
          <li key={i}>
            <ArticlePreview withType {...article} />
          </li>
        ))}
      </ul>
    </section>
  );
}
