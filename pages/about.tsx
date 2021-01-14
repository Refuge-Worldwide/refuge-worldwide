import Head from "next/head";
import Layout from "../components/layout";
import SinglePage from "../components/singlePage";
import { AboutPageData, getAboutPage } from "../lib/api";
import { renderRichTextWithImages } from "../lib/rich-text";

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

      <SinglePage coverImage={data.coverImage}>
        <section>
          <div className="container-md p-4 sm:p-8 bg-white">
            <div className="prose sm:prose-lg max-w-none">
              {renderRichTextWithImages(data.content)}
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
      data: await getAboutPage(preview),
    },
  };
}
