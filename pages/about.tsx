import Head from "next/head";
import Layout from "../components/layout";
import { AboutPageData, getAboutPage } from "../lib/api";
import AboutView from "../views/about";

interface Page extends JSX.Element {
  preview: boolean;
  data: AboutPageData;
}

export default function AboutPage({ preview, data }: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>About</title>
      </Head>

      <AboutView data={data} />
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      data: await getAboutPage(preview),
    },
  };
}
