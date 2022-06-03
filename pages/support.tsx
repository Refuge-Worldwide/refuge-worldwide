import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import Prose from "../components/Prose";
import PageMeta from "../components/seo/page";
import { getSupportPage } from "../lib/contentful/pages/support";
import SinglePage from "../views/singlePage";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getSupportPage(preview)),
    },
    revalidate: 60 * 60 * 24,
  };
}

export default function SupportPage({
  preview,
  content,
  coverImage,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="Support | Refuge Worldwide" path="support/" />

      <SinglePage coverImage={coverImage}>
        <section>
          <div className="container-md p-4 sm:p-8 bg-white">
            <Prose>{documentToReactComponents(content?.json)}</Prose>
          </div>
        </section>
      </SinglePage>
    </Layout>
  );
}
