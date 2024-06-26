import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import Prose from "../components/Prose";
import PageMeta from "../components/seo/page";
import { getAccessPage } from "../lib/contentful/pages/access";
import { RenderRichTextWithImages } from "../lib/rich-text";
import SinglePage from "../views/singlePage";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getAccessPage(preview)),
    },
    revalidate: 60 * 60 * 24,
  };
}

export default function AccessPage({
  preview,
  coverImage,
  content,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="Access | Refuge Worldwide" path="access/" />

      <SinglePage coverImage={coverImage}>
        <section>
          <div className="container-md p-4 sm:p-8 bg-white">
            <Prose>{RenderRichTextWithImages(content)}</Prose>
          </div>
        </section>
      </SinglePage>
    </Layout>
  );
}
