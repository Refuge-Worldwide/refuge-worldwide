import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Head from "next/head";
import Layout from "../components/layout";
import SinglePage from "../views/singlePage";
import { getSupportPage, SupportPageData } from "../lib/api";

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

      <SinglePage coverImage={data.coverImage}>
        <section>
          <div className="container-md p-4 sm:p-8 bg-white">
            <div className="prose sm:prose-lg max-w-none">
              {documentToReactComponents(data?.content?.json)}
            </div>
          </div>
        </section>
      </SinglePage>
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
