import { useCallback, useState } from "react";
import { InferGetStaticPropsType } from "next";
import { getSubmissionPage } from "../lib/contentful/pages/submission";
import BookingPasswordForm from "../components/bookingForm";
import ShowSubmissionForm from "../components/showSubmissionForm";
import ShowSubmissionInfo from "../components/showSubmissionInfoToggle";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import SinglePage from "../views/singlePage";

import { getAllGenres } from "../lib/contentful/pages/radio";
import { getAllArtists } from "../lib/contentful/pages/submission";

export async function getStaticProps({ preview = false }) {
  const genres = await getAllGenres();
  const artists = await getAllArtists(1000, 0);

  return {
    props: {
      genres: genres.map((genre) => ({
        value: genre.sys.id,
        label: genre.name,
      })),
      artists: artists.map((artists) => ({
        value: artists.sys.id,
        label: artists.name,
      })),
      preview,
      ...(await getSubmissionPage(preview)),
    },
  };
}

export default function NewSubmissionPage({
  genres,
  artists,
  coverImage,
  liveShows,
  liveShows2,
  preRecords,
  uploadLink,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [passwordCorrect, passwordCorrectSet] = useState(false);
  const [readInfo, setReadInfo] = useState<boolean>(false);

  const onPasswordCorrect = useCallback(() => {
    passwordCorrectSet(true);
  }, []);

  const handleReadInfo = () => {
    setReadInfo(true);
    const form = document.getElementById("submission-form");
    form.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      <PageMeta title="Show Submission | Refuge Worldwide" path="submission/" />
      <SinglePage coverImage={coverImage}>
        <section className="container-md p-4 sm:p-8 bg-white">
          <div id="submission-form" className="prose max-w-none sm:prose-lg">
            <h1>Show Submission Form</h1>
            {/* {passwordCorrect ? ( */}
            <ShowSubmissionInfo
              onReadInfo={handleReadInfo}
              liveShows={liveShows}
              liveShows2={liveShows2}
              preRecords={preRecords}
            />
            {readInfo && (
              <ShowSubmissionForm
                genres={genres}
                artists={artists}
                uploadLink={uploadLink}
              />
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