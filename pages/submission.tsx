import { useCallback, useState } from "react";
import BookingPasswordForm from "../components/bookingForm";
import ShowSubmissionForm from "../components/showSubmissionForm";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import { getAllGenres } from "../lib/contentful/pages/radio";
import { getArtistsPage } from "../lib/contentful/pages/artists";

export async function getStaticProps() {
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
    },
  };
}

export default function NewSubmissionPage({ genres, residents }) {
  const [passwordCorrect, passwordCorrectSet] = useState(false);

  const onPasswordCorrect = useCallback(() => {
    passwordCorrectSet(true);
  }, []);

  return (
    <Layout>
      <PageMeta title="Show Submission | Refuge Worldwide" path="submission/" />

      {/* {passwordCorrect ? ( */}
      <section className="py-48 md:py-72">
        <div className="container-md p-4 sm:p-8">
          <ShowSubmissionForm genres={genres} residents={residents} />
        </div>
      </section>
      {/* ) : ( */}
      {/* <section className="py-48 md:py-72">
          <div className="container-md p-4 sm:p-8">
            <BookingPasswordForm onPasswordCorrect={onPasswordCorrect} />
          </div>
        </section> */}
      {/* )} */}
    </Layout>
  );
}
