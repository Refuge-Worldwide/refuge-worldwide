import Head from "next/head";
import Layout from "../../components/layout";
import { getAllArticles } from "../../lib/api";
import { ArticleInterface } from "../../types/shared";
import NewsView from "../../views/news";

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

      <NewsView articles={articles} />
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      articles: await getAllArticles(preview),
      preview,
    },
  };
}
