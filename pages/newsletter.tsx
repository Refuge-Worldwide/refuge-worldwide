import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import Subscribe from "../components/subscribe";
import { getNewsletterPage } from "../lib/contentful/pages";
import SinglePage from "../views/singlePage";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getNewsletterPage(preview)),
    },
    revalidate: 60 * 60 * 24,
  };
}

export default function NewsletterPage({
  preview,
  content,
  coverImage,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="Newsletter | Refuge Worldwide" path="newsletter/" />

      <SinglePage coverImage={coverImage}>
        <section>
          <div className="container-md p-4 sm:p-8 bg-white">
            <div className="prose sm:prose-lg max-w-none">
              {documentToReactComponents(content?.json)}
            </div>

            <div className="h-10" />

            <Subscribe />
          </div>
        </section>
      </SinglePage>
    </Layout>
  );
}
