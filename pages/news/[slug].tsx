import { useRouter } from "next/dist/client/router";
import ErrorPage from "next/error";
import Layout from "../../components/layout";
import ArticleMeta from "../../components/seo/article";
import { getAllArticles, getArticleAndMoreArticles } from "../../lib/api";
import { ArticleInterface } from "../../types/shared";
import Loading from "../../views/loading";
import ArticleBody from "../../views/news/articleBody";
import SinglePage from "../../views/singlePage";

interface Page extends JSX.Element {
  article: ArticleInterface;
  preview: boolean;
}

export default function Article({ article, preview }: Page) {
  const router = useRouter();

  if (!router.isFallback && !article) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout preview={preview}>
      {router.isFallback ? (
        <Loading />
      ) : (
        <>
          <ArticleMeta {...article} />

          <SinglePage
            coverImage={article.coverImage}
            objectPosition={article.coverImagePosition}
            withBackButton
          >
            <ArticleBody {...article} />
          </SinglePage>
        </>
      )}
    </Layout>
  );
}

export async function getStaticProps({ params, preview = false }) {
  const data = await getArticleAndMoreArticles(params.slug, preview);

  return {
    props: {
      preview,
      article: data?.article,
    },
  };
}

export async function getStaticPaths() {
  const allArticles = await getAllArticles(false);

  return {
    paths: allArticles?.map(({ slug }) => `/news/${slug}`) ?? [],
    fallback: true,
  };
}
