import Head from "next/head";
import Layout from "../components/layout";
import {
  getFeaturedArticles,
  getFeaturedShows,
  getLatestArticles,
} from "../lib/api";
import { ArticleInterface, ShowInterface } from "../types/shared";
import FeaturedShows from "../views/home/featuredShows";
import LatestNews from "../views/home/latestNews";
import FeaturedArticles from "../views/news/featuredArticles";

interface Page extends JSX.Element {
  preview: boolean;
  featuredShows: ShowInterface[];
  latestArticles: ArticleInterface[];
  featuredArticles: ArticleInterface[];
}

export default function HomePage({
  preview,
  featuredShows,
  latestArticles,
  featuredArticles,
}: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>Refuge Worldwide</title>
      </Head>

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
    },
  };
}
