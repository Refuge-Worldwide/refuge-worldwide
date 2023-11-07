import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import Prose from "../components/Prose";
import PageMeta from "../components/seo/page";
import { getPrivacyPage } from "../lib/contentful/pages/privacy";
import { renderRichTextWithImages } from "../lib/rich-text";
import SinglePage from "../views/singlePage";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getPrivacyPage(preview)),
    },
    revalidate: 60 * 60 * 24,
  };
}

export default function PrivacyPage({
  preview,
  coverImage,
  content,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta
        title="Privacy Policy | Refuge Worldwide"
        path="privacy-policy/"
      />

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
