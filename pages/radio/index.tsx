import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import { getGenres, getUpcomingAndPastShows } from "../../lib/api";
import { ShowInterface } from "../../types/shared";
import AllShows from "../../views/radio/allShows";
import NextShows from "../../views/radio/nextShows";

interface Page extends JSX.Element {
  genres: string[];
  pastShows: ShowInterface[];
  preview: boolean;
  upcomingShows: ShowInterface[];
}

export default function RadioPage({
  genres,
  pastShows,
  preview,
  upcomingShows,
}: Page) {
  return (
    <Layout preview={preview}>
      <PageMeta title="Radio | Refuge Worldwide" path="radio/" />

      <h1 hidden>Radio</h1>

      <NextShows upcomingShows={upcomingShows} />

      <AllShows genres={genres} pastShows={pastShows} />
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  const { upcoming, past } = await getUpcomingAndPastShows(preview, 500);
  const genres = await getGenres(preview);

  return {
    props: {
      preview,
      upcomingShows: upcoming,
      pastShows: past,
      genres,
    },
    revalidate: 60,
  };
}
