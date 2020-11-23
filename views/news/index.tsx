import { Fragment } from "react";
import { ArticleInterface } from "../../types/shared";
import AllArticles from "./allArticles";
import FeaturedArticle from "./featuredArticle";

export default function NewsView({
  articles,
}: {
  articles: ArticleInterface[];
}) {
  return (
    <Fragment>
      <FeaturedArticle />

      <AllArticles articles={articles} />
    </Fragment>
  );
}
