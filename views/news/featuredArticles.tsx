import FeaturedArticlePreview from "../../components/featuredArticlePreview";
import { ArticleInterface } from "../../types/shared";

export default function FeaturedArticles({
  articles,
}: {
  articles: ArticleInterface[];
}) {
  return (
    <section>
      <ul>
        {articles.map((article, i) => (
          <li key={i}>
            <FeaturedArticlePreview {...article} />
          </li>
        ))}
      </ul>
    </section>
  );
}
