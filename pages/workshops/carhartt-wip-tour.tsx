import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import Prose from "../../components/Prose";
import PageMeta from "../../components/seo/page";
import { getTourPage } from "../../lib/contentful/pages/tour";
import { RenderRichTextWithImages } from "../../lib/rich-text";
import SinglePage from "../../views/singlePage";
import TourWorkshopForm from "../../views/tourWorkshopForm";

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
        title="Carhartt WIP Tour - Workshop Application | Refuge Worldwide"
        path="tour-workshop-signup/"
      />
      <SinglePage coverImage={coverImage} objectPosition="top">
        <div className="container-md p-4 sm:p-8 bg-white">
          <div>
            <Prose>{RenderRichTextWithImages(content)}</Prose>
          </div>
          <div className="mt-16">
            <TourWorkshopForm />
          </div>
        </div>
      </SinglePage>
    </Layout>
  );
}
