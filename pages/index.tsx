import Head from "next/head";
import Layout from "../components/layout";
import { getFeaturedShows, getLatestNews } from "../lib/api";
import { ArticleInterface, ShowInterface } from "../types/shared";
import FeaturedShows from "../views/home/featuredShows";
import LatestNews from "../views/home/latestNews";

interface Page extends JSX.Element {
  preview: boolean;
  featuredShows: ShowInterface[];
  latestNews: ArticleInterface[];
}

export default function HomePage({ preview, featuredShows, latestNews }: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>Refuge Worldwide</title>
      </Head>

      <FeaturedShows shows={featuredShows} />

      <section>
        <h2>SLIDER HERE</h2>
      </section>

      <LatestNews news={latestNews} />
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  const featuredShows = await getFeaturedShows(preview);
  const latestNews = await getLatestNews(preview);

  return {
    props: {
      preview,
      featuredShows,
      latestNews,
    },
  };
}
