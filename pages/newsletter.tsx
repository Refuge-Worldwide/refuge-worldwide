import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Head from "next/head";
import Layout from "../components/layout";
import SinglePage from "../components/singlePage";
import { getNewsletterPage, NewsletterPageData } from "../lib/api";

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

      <SinglePage coverImage={data.coverImage}>
        <div className="p-4 sm:p-8 prose sm:prose-lg">
          {documentToReactComponents(data?.content?.json)}
        </div>
      </SinglePage>
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
