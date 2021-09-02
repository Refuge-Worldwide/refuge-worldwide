import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import { getAboutPage } from "../lib/api";
import { renderRichTextWithImages } from "../lib/rich-text";
import SinglePage from "../views/singlePage";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      data: await getAboutPage(preview),
    },
  };
}

export default function AboutPage({
  preview,
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="About | Refuge Worldwide" path="about/" />

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
