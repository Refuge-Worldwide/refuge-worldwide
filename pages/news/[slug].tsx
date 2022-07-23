import Layout from "../../components/layout";
import ArticleMeta from "../../components/seo/article";
import { getNewsPageSingle } from "../../lib/contentful/pages/news";
import { getArticlePathsToPreRender } from "../../lib/contentful/paths";
import { ArticleInterface } from "../../types/shared";
import ArticleBody from "../../views/news/articleBody";
import RelatedArticles from "../../views/news/relatedArticles";
import SinglePage from "../../views/singlePage";

type ArticleProps = {
  article: ArticleInterface;
  preview: boolean;
  relatedArticles?: ArticleInterface[];
};

export default function Article({
  article,
  preview,
  relatedArticles,
}: ArticleProps) {
  return (
    <Layout preview={preview}>
      <ArticleMeta {...article} />

      <SinglePage
        coverImage={article.coverImage}
        objectPosition={article.coverImagePosition}
        withBackButton
      >
        <ArticleBody {...article} />
      </SinglePage>

      <RelatedArticles articles={relatedArticles} />
    </Layout>
  );
}

export async function getStaticProps({ params, preview = false }) {
  const data = await getNewsPageSingle(params.slug, preview);

  return {
    props: { preview, ...data },
  };
}

export async function getStaticPaths() {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    return {
      paths: [],
      fallback: "blocking",
    };
  }

  const paths = await getArticlePathsToPreRender();

  return { paths, fallback: "blocking" };
}
