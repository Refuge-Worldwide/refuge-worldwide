import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import { getHomePage } from "../lib/api";
import FeaturedShows from "../views/home/featuredShows";
import LatestNews from "../views/home/latestNews";
import NextUp from "../views/home/nextUp";
import FeaturedArticles from "../views/news/featuredArticles";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getHomePage()),
    },
  };
}

export default function HomePage({
  featuredArticles,
  featuredShows,
  latestArticles,
  nextUp,
  preview,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="Refuge Worldwide" path="/" />

      <NextUp {...nextUp} />

      <FeaturedShows shows={featuredShows} />

      <FeaturedArticles articles={featuredArticles} />

      <LatestNews articles={latestArticles} />
    </Layout>
  );
}
