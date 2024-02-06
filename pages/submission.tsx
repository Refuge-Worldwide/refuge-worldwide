import { InferGetStaticPropsType } from "next";
import { getSubmissionPage } from "../lib/contentful/pages/submission";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import SinglePage from "../views/singlePage";
import Head from "next/head";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getSubmissionPage(preview)),
    },
  };
}

export default function NewSubmissionPage({
  coverImage,
  liveShows,
  liveShows2,
  preRecords,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const importantInfo = {
    liveShows: liveShows,
    liveShows2: liveShows2,
    preRecords: preRecords,
  };

  return (
    <Layout pageId="1eohijLMd2Q38BVq0D713p">
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <PageMeta title="Show Submission | Refuge Worldwide" path="submission/" />
      <SinglePage coverImage={coverImage}>
        <section className="container-md p-4 sm:p-8 bg-white">
          <div id="submission-form" className="prose max-w-none sm:prose-lg">
            <h1>Show Submission Form</h1>
            <div className="h-6 md:h-12" />
            <p className="my-24">
              This submission form is no longer active. You should recieve an
              email from us ahead of your show with info on how to submit info
              through our new submission form.
            </p>
            <div className="h-6 md:h-12" />
          </div>
        </section>
      </SinglePage>
    </Layout>
  );
}
