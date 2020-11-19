import Head from "next/head";
import Layout from "../../components/layout";
import NewsView from "../../views/news";

interface Page extends JSX.Element {
  preview: boolean;
}

export default function NewsPage({ preview }: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>News</title>
      </Head>

      <h1 hidden>News</h1>

      <NewsView />
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
    },
  };
}
