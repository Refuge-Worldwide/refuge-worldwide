import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import Prose from "../../components/Prose";
import PageMeta from "../../components/seo/page";
import { getTourPage } from "../../lib/contentful/pages/tour";
import { renderRichTextWithImages } from "../../lib/rich-text";
import SinglePage from "../../views/singlePage";
import TourWorkshopForm from "../../views/tourWorkshopForm";
import Script from "next/script";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getTourPage(preview)),
    },
    revalidate: 60 * 60 * 24,
  };
}

export default function AboutPage({
  preview,
  coverImage,
  content,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta
        title="Mixed Feelings | Refuge Worldwide"
        path="tour-workshop-signup/"
      />
      <SinglePage coverImage={coverImage} objectPosition="top">
        <div className="container-md p-4 sm:p-8 bg-white">
          <div>
            <Prose>{renderRichTextWithImages(content)}</Prose>
          </div>
          <div className="mt-16">
            <iframe
              data-tally-src="https://tally.so/embed/wzMMAq?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
              width="100%"
              height="300"
              title="Mixed feeling workshop form"
              className="mb-24"
            ></iframe>

            <Script
              id="tally-js"
              src="https://tally.so/widgets/embed.js"
              onLoad={() => {
                let Tally: any;
                Tally.loadEmbeds();
              }}
            />
          </div>
        </div>
      </SinglePage>
    </Layout>
  );
}
