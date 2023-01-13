import { useCallback, useState } from "react";
import { InferGetStaticPropsType } from "next";
import { getSubmissionPage } from "../lib/contentful/pages/submission";
import BookingPasswordForm from "../components/bookingForm";
import ShowSubmissionForm from "../components/showSubmissionForm";
import ShowSubmissionInfo from "../components/showSubmissionInfo";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import SinglePage from "../views/singlePage";

import { getAllGenres } from "../lib/contentful/pages/radio";
import { getArtistsPage } from "../lib/contentful/pages/artists";

export async function getStaticProps({ preview = false }) {
  const genres = await getAllGenres();
  const residents = await getArtistsPage(true, 1000, 0);

  return {
    props: {
      genres: genres.map((genre) => ({
        value: genre.sys.id,
        label: genre.name,
      })),
      residents: residents.map((resident) => ({
        value: resident.slug,
        label: resident.name,
      })),
      preview,
      ...(await getSubmissionPage(preview)),
    },
  };
}

export default function NewSubmissionPage({
  genres,
  residents,
  coverImage,
  equipment,
  liveShows,
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
            <h1>Show Submission Form</h1>
            {/* {passwordCorrect ? ( */}
            <ShowSubmissionInfo
              onReadInfo={setReadInfo}
              equipment={equipment}
              liveShows={liveShows}
              preRecords={preRecords}
            />
            {readInfo && (
              <ShowSubmissionForm genres={genres} residents={residents} />
            )}
            {/* ) : ( */}
            {/* <section className="py-48 md:py-72">
                <div className="container-md p-4 sm:p-8">
                  <BookingPasswordForm onPasswordCorrect={onPasswordCorrect} />
                </div>
              </section> */}
            {/* )} */}
          </div>
        </section>
      </SinglePage>
    </Layout>
  );
}
