import Head from "next/head";
import Layout from "../../components/layout";
import AllShows from "../../views/radio/allShows";
import NextShows from "../../views/radio/nextShows";

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

      <NextShows />

      <AllShows />
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
