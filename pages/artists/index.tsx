import Head from "next/head";
import Layout from "../../components/layout";

interface Page extends JSX.Element {
  preview: boolean;
}

export default function ArtistsPage({ preview }: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>Artists</title>
      </Head>

      <h1>Artists</h1>
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
