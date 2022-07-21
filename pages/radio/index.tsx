import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import { getPastShows } from "../../lib/contentful/client";
import {
  getAllGenres,
  getUpcomingShows,
  RADIO_SHOWS_PAGE_SIZE,
} from "../../lib/contentful/pages/radio";
import AllShows from "../../views/radio/allShows";
import NextShows from "../../views/radio/nextShows";

export async function getStaticProps({ preview = false }) {
  const upcomingShows = await getUpcomingShows(preview);

  const pastShows = await getPastShows(RADIO_SHOWS_PAGE_SIZE, 0, "All");

  const genres = await getAllGenres();

  return {
    props: {
      preview,
      upcomingShows,
      genres: genres.map((genre) => genre.name),
      pastShows,
    },
  };
}

export default function RadioPage({
  genres,
  pastShows,
  preview,
  upcomingShows,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="Radio | Refuge Worldwide" path="radio/" />

      <h1 hidden>Radio</h1>

      {upcomingShows.length > 0 && <NextShows upcomingShows={upcomingShows} />}

      <AllShows genres={genres} pastShows={pastShows} />
    </Layout>
  );
}
