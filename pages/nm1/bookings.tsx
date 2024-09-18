import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import Prose from "../../components/Prose";
import PageMeta from "../../components/seo/page";
import { getNM1BookingPage } from "../../lib/contentful/pages/nm1booking";
import { RenderRichTextWithImages } from "../../lib/rich-text";
import SinglePage from "../../views/singlePage";
import Head from "next/head";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getNM1BookingPage(preview)),
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
    <Layout preview={preview} pageId="7nZvcNfNVRrZGs6x42RV3l">
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <PageMeta title="NM1 Bookings | Refuge Worldwide" path="/nm1/bookings/" />
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
