import FeaturedArticlePreview from "../../components/featuredArticlePreview";
import { ArticleInterface } from "../../types/shared";

export default function FeaturedArticles({
  articles,
}: {
  articles: ArticleInterface[];
}) {
  return (
    <section className="relative">
      {/* Articles */}
      <ul className="carousel">
        {articles.map((article, i) => (
          <li key={i}>
            <FeaturedArticlePreview {...article} />
          </li>
        ))}
      </ul>

      {/* Indicators */}
      <ul className="absolute bottom-8 inset-x-0 flex justify-center space-x-3">
        {articles?.map((_, i) => (
          <li key={i}>
            <button className="block h-6 w-6 rounded-full border-2 border-white bg-transparent focus:outline-none focus:ring-4" />
          </li>
        ))}
      </ul>
    </section>
  );
}
