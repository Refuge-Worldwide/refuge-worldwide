import Head from "next/head";
import Layout from "../../components/layout";

interface Page extends JSX.Element {
  preview: boolean;
}

export default function NewsPage({ preview }: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>News</title>
      </Head>

      <h1>News</h1>
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
