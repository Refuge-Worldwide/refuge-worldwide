import Link from "next/link";
import { Arrow } from "../icons/arrow";
import { ArticleInterface } from "../types/shared";
import Badge from "./badge";
import Date from "./date";

export default function ArticlePreview({
  slug,
  title,
  date,
  articleType,
}: ArticleInterface) {
  return (
    <Link href={`/news/${slug}`}>
      <a>
        <article>
          <div>IMAGE HERE</div>

          <p>
            <Date dateString={date} formatString={"DD.MM.YYYY"} />
          </p>

          <h2>{title}</h2>

          <Badge text={articleType} />

          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque,
            et. Suscipit, veniam eligendi. Nisi, in asperiores. Esse
            necessitatibus neque ducimus id. Officia error voluptatum hic
            asperiores quam tempora ipsum mollitia?
          </p>

          <p className="inline-flex items-center space-x-5">
            <span className="underline">Read more</span>
            <Arrow />
          </p>
        </article>
      </a>
    </Link>
  );
}
