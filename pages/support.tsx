import Head from "next/head";
import Layout from "../components/layout";
import { getSupportPage, SupportPageData } from "../lib/api";
import SupportView from "../views/support";

interface Page extends JSX.Element {
  preview: boolean;
  data: SupportPageData;
}

export default function SupportPage({ preview, data }: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>Support</title>
      </Head>

      <SupportView data={data} />
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      data: await getSupportPage(preview),
    },
  };
}
