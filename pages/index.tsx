import Head from "next/head";
import Layout from "../components/layout";
import {
  getFeaturedArticles,
  getFeaturedShows,
  getLatestArticles,
  getTodaySection,
  TodaySection,
} from "../lib/api";
import { ArticleInterface, ShowInterface } from "../types/shared";
import FeaturedShows from "../views/home/featuredShows";
import LatestNews from "../views/home/latestNews";
import Today from "../views/home/today";
import FeaturedArticles from "../views/news/featuredArticles";

interface Page extends JSX.Element {
  preview: boolean;
  featuredShows: ShowInterface[];
  latestArticles: ArticleInterface[];
  featuredArticles: ArticleInterface[];
  todaySection: TodaySection;
}

export default function HomePage({
  preview,
  featuredShows,
  latestArticles,
  featuredArticles,
  todaySection,
}: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>Refuge Worldwide</title>
      </Head>

      <Today {...todaySection} />

      <FeaturedShows shows={featuredShows} />

      <FeaturedArticles articles={featuredArticles} />

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
      featuredArticles: await getFeaturedArticles(preview),
      todaySection: await getTodaySection(preview),
    },
    revalidate: 60,
  };
}
