import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import Prose from "../components/Prose";
import PageMeta from "../components/seo/page";
import Subscribe from "../components/subscribe";
import { getNewsletterPage } from "../lib/contentful/pages/newsletter";
import SinglePage from "../views/singlePage";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getNewsletterPage(preview)),
    },
  };
}

export default function NewsletterPage({
  preview,
  content,
  coverImage,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview} pageId="7t2jOQoBCZ6sGK4HgBZZ42">
      <PageMeta title="Newsletter | Refuge Worldwide" path="newsletter/" />

      <SinglePage coverImage={coverImage}>
        <section>
          <div className="container-md p-4 sm:p-8 bg-white">
            <Prose>{documentToReactComponents(content?.json)}</Prose>

            <div className="h-10" />

            <Subscribe />
          </div>
        </section>
      </SinglePage>
    </Layout>
  );
}
