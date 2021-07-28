import Layout from "../../components/layout";
import ArticleMeta from "../../components/seo/article";
import {
  getAllArticlePaths,
  getAllArticles,
  getArticleAndMoreArticles,
} from "../../lib/api";
import { ArticleInterface } from "../../types/shared";
import ArticleBody from "../../views/news/articleBody";
import RelatedArticles from "../../views/news/relatedArticles";
import SinglePage from "../../views/singlePage";

interface Page extends JSX.Element {
  article: ArticleInterface;
  preview: boolean;
  relatedArticles?: ArticleInterface[];
}

export default function Article({ article, relatedArticles, preview }: Page) {
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

      {relatedArticles?.length > 0 && (
        <RelatedArticles articles={relatedArticles} />
      )}
    </Layout>
  );
}

export async function getStaticProps({ params, preview = false }) {
  const data = await getArticleAndMoreArticles(params.slug, preview);

  return {
    props: {
      preview,
      article: data.article,
      relatedArticles: data?.relatedArticles,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  return {
    paths: await getAllArticlePaths(),
    fallback: "blocking",
  };
}
