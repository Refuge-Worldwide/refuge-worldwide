import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";

// export async function getStaticProps({ preview = false }) {
//   const upcomingShows = await getUpcomingShows(preview);

//   const pastShows = await getPastShows(RADIO_SHOWS_PAGE_SIZE, 0, []);

//   const genres = await getAllGenres();

//   return {
//     props: {
//       preview,
//       upcomingShows,
//       genres: genres.map((genre) => genre.name),
//       pastShows,
//     },
//   };
// }

export default function RadioPage() {
  return (
    <Layout>
      <PageMeta title="Radio | Refuge Worldwide" path="radio/" />
      <h1>Schedule</h1>
    </Layout>
  );
}
