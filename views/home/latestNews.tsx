import Link from "next/link";
import Pill from "../../components/pill";
import { Arrow } from "../../icons/arrow";
import { ArticleInterface } from "../../types/shared";

export default function LatestNews({ news }: { news: ArticleInterface[] }) {
  return (
    <section>
      <Pill>
        <h2>News</h2>
      </Pill>

      <ul>
        {news.map((article, i) => (
          <li key={i}>{article.title}</li>
        ))}
      </ul>

      <div className="text-center">
        <Link href="/news">
          <a className="inline-flex items-center space-x-4 font-medium">
            <span className="underline">All News</span>
            <Arrow />
          </a>
        </Link>
      </div>
    </section>
  );
}
