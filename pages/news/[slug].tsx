import Layout from "../../components/layout";
import ArticleMeta from "../../components/seo/article";
import { getArticleAndMoreArticles } from "../../lib/contentful";
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
  try {
    const data = await getArticleAndMoreArticles(params.slug, preview);

    return {
      props: { preview, ...data },
      revalidate: 60,
    };
  } catch (error) {
    console.error(error);

    return {
      notFound: true,
    };
  }
}

export async function getStaticPaths() {
  const paths = await getArticlePathsToPreRender();

  return { paths, fallback: "blocking" };
}
