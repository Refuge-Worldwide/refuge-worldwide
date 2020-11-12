import Head from "next/head";
import Layout from "../components/layout";
import { getNewsletterPage, NewsletterPageData } from "../lib/api";
import NewsletterView from "../views/newsletter";

interface Page extends JSX.Element {
  preview: boolean;
  data: NewsletterPageData;
}

export default function NewsletterPage({ preview, data }: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>Newsletter</title>
      </Head>

      <NewsletterView data={data} />
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      data: await getNewsletterPage(preview),
    },
  };
}
