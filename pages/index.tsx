import Head from "next/head";
import Layout from "../components/layout";
import { getFeaturedShows, getLatestArticles } from "../lib/api";
import { ArticleInterface, ShowInterface } from "../types/shared";
import FeaturedShows from "../views/home/featuredShows";
import LatestNews from "../views/home/latestNews";

interface Page extends JSX.Element {
  preview: boolean;
  featuredShows: ShowInterface[];
  latestArticles: ArticleInterface[];
}

export default function HomePage({
  preview,
  featuredShows,
  latestArticles,
}: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>Refuge Worldwide</title>
      </Head>

      <FeaturedShows shows={featuredShows} />

      <section>
        <h2>SLIDER HERE</h2>
      </section>

      <LatestNews articles={latestArticles} />
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      featuredShows: await getFeaturedShows(preview),
      latestArticles: await getLatestArticles(preview),
    },
  };
}
