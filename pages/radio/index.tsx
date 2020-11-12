import Head from "next/head";
import Layout from "../../components/layout";

interface Page extends JSX.Element {
  preview: boolean;
}

export default function RadioPage({ preview }: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>Radio</title>
      </Head>

      <h1>Radio</h1>
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
