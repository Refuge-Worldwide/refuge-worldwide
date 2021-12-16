import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import { getAboutPage } from "../lib/contentful/pages/about";
import { renderRichTextWithImages } from "../lib/rich-text";
import SinglePage from "../views/singlePage";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getAboutPage(preview)),
    },
    revalidate: 60 * 60 * 24,
  };
}

export default function AboutPage({
  preview,
  coverImage,
  coverImageBlurDataURL,
  content,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="About | Refuge Worldwide" path="about/" />

      <SinglePage
        coverImage={coverImage}
        coverImageBlurDataURL={coverImageBlurDataURL}
      >
        <section>
          <div className="container-md p-4 sm:p-8 bg-white">
            <div className="prose sm:prose-lg max-w-none">
              {renderRichTextWithImages(content)}
            </div>
          </div>
        </section>
      </SinglePage>
    </Layout>
  );
}
