import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import Prose from "../components/Prose";
import PageMeta from "../components/seo/page";
import { getValuesPage } from "../lib/contentful/pages/values";
import { renderRichTextWithImages } from "../lib/rich-text";
import SinglePage from "../views/singlePage";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getValuesPage(preview)),
    },
    revalidate: 60 * 60 * 24,
  };
}

export default function ValuesPage({
  preview,
  coverImage,
  content,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="Values | Refuge Worldwide" path="values/" />

      <SinglePage coverImage={coverImage}>
        <section>
          <div className="container-md p-4 sm:p-8 bg-white">
            <Prose>{renderRichTextWithImages(content)}</Prose>
          </div>
        </section>
      </SinglePage>
    </Layout>
  );
}
