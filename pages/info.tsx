import { useCallback, useState } from "react";
import { InferGetStaticPropsType } from "next";
import { getSubmissionPage } from "../lib/contentful/pages/submission";
import ShowSubmissionInfo from "../components/showSubmissionInfo";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import SinglePage from "../views/singlePage";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getSubmissionPage(preview)),
    },
  };
}

export default function InfoPage({
  coverImage,
  liveShows,
  liveShows2,
  preRecords,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [passwordCorrect, passwordCorrectSet] = useState(false);
  const [readInfo, setReadInfo] = useState<boolean>(false);

  const onPasswordCorrect = useCallback(() => {
    passwordCorrectSet(true);
  }, []);

  return (
    <Layout>
      <PageMeta title="Show Submission | Refuge Worldwide" path="submission/" />
      <SinglePage coverImage={coverImage}>
        <section className="container-md p-4 sm:p-8 bg-white">
          <div className="prose max-w-none sm:prose-lg">
            <h1>Important Info</h1>
            <ShowSubmissionInfo
              onReadInfo={setReadInfo}
              liveShows={liveShows}
              liveShows2={liveShows2}
              preRecords={preRecords}
            />
          </div>
        </section>
      </SinglePage>
    </Layout>
  );
}
