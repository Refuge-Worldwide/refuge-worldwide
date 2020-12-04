import Head from "next/head";
import Layout from "../../components/layout";
import { getAllArticles, getFeaturedArticles } from "../../lib/api";
import { ArticleInterface } from "../../types/shared";
import AllArticles from "../../views/news/allArticles";
import FeaturedArticle from "../../views/news/featuredArticles";

interface Page extends JSX.Element {
  preview: boolean;
  articles: ArticleInterface[];
  featuredArticles: ArticleInterface[];
}

export default function NewsPage({
  preview,
  articles,
  featuredArticles,
}: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>News</title>
      </Head>

      <h1 hidden>News</h1>

      <FeaturedArticle articles={featuredArticles} />

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
