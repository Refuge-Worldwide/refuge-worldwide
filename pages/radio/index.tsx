import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import {
  getUpcomingShows,
  RADIO_SHOWS_PAGE_SIZE,
} from "../../lib/contentful/pages/radio";
import prisma from "../../lib/prisma";
import AllShows from "../../views/radio/allShows";
import NextShows from "../../views/radio/nextShows";

export async function getStaticProps({ preview = false }) {
  const upcomingShows = await getUpcomingShows(preview);

  const shows = await prisma.show.findMany({
    take: RADIO_SHOWS_PAGE_SIZE,
    skip: 0,
    include: {
      genres: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  const processed = shows.map((show) => ({
    ...show,
    date: show.date.toString(),
    updatedAt: show.updatedAt.toString(),
    genres: show.genres.map((genre) => genre.name),
  }));

  const genres = await prisma.genre.findMany({
    where: {
      shows: {
        some: {},
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return {
    props: {
      preview,
      upcomingShows,
      genres: genres.map((genre) => genre.name),
      pastShows: processed,
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
