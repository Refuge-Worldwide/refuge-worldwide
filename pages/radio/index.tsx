import Head from "next/head";
import Layout from "../../components/layout";
import RadioView from "../../views/radio";

interface Page extends JSX.Element {
  preview: boolean;
}

export default function RadioPage({ preview }: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>Radio</title>
      </Head>

      <h1 hidden>Radio</h1>

      <RadioView />
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
