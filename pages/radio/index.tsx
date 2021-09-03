import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import { getRadioPage } from "../../lib/contentful/pages";
import AllShows from "../../views/radio/allShows";
import NextShows from "../../views/radio/nextShows";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getRadioPage(preview)),
    },
    revalidate: 60,
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

      <NextShows upcomingShows={upcomingShows} />

      <AllShows genres={genres} pastShows={pastShows} />
    </Layout>
  );
}
