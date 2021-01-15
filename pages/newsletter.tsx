import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import Subscribe from "../components/subscribe";
import { getNewsletterPage, NewsletterPageData } from "../lib/api";
import SinglePage from "../views/singlePage";

interface Page extends JSX.Element {
  preview: boolean;
  data: NewsletterPageData;
}

export default function NewsletterPage({ preview, data }: Page) {
  return (
    <Layout preview={preview}>
      <PageMeta title="Newsletter | Refuge Worldwide" path="newsletter/" />

      <SinglePage coverImage={data.coverImage}>
        <section>
          <div className="container-md p-4 sm:p-8 bg-white">
            <div className="prose sm:prose-lg max-w-none">
              {documentToReactComponents(data?.content?.json)}
            </div>

            <div className="h-10" />

            <Subscribe />
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
      data: await getNewsletterPage(preview),
    },
  };
}
