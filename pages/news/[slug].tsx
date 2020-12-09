import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useRouter } from "next/dist/client/router";
import ErrorPage from "next/error";
import Head from "next/head";
import ArticleBody from "../../components/articleBody";
import Layout from "../../components/layout";
import SinglePage from "../../components/singlePage";
import { getAllArticles, getArticleAndMoreArticles } from "../../lib/api";
import { ArticleInterface } from "../../types/shared";

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
        <h1>Loading…</h1>
      ) : (
        <>
          <Head>
            <title>{article.title} | Refuge Worldwide</title>
            <meta property="og:image" content={article.coverImage.url} />
          </Head>

          <SinglePage coverImage={article.coverImage} withBackButton>
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
