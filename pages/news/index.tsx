import Head from "next/head";
import Layout from "../../components/layout";
import { getAllArticles, getFeaturedArticles } from "../../lib/api";
import { ArticleInterface } from "../../types/shared";
import AllArticles from "../../views/news/allArticles";
import FeaturedArticle from "../../views/news/featuredArticle";

interface Page extends JSX.Element {
  preview: boolean;
  articles: ArticleInterface[];
}

export default function NewsPage({ preview, articles }: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>News</title>
      </Head>

      <h1 hidden>News</h1>

      <FeaturedArticle />

      <AllArticles articles={articles} />
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      articles: await getAllArticles(preview),
      featuredArticles: await getFeaturedArticles(preview),
      preview,
    },
  };
}
