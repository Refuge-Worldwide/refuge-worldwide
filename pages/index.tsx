import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import { getHomePage } from "../lib/contentful/pages/home";
import FeaturedShows from "../views/home/featuredShows";
import LatestNews from "../views/home/latestNews";
import NextUp from "../views/home/nextUp";
import FeaturedArticles from "../views/news/featuredArticles";
import Head from "next/head";

export async function getStaticProps() {
  return {
    props: await getHomePage(),
  };
}

export default function HomePage({
  featuredArticles,
  featuredShows,
  latestArticles,
  nextUp,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout pageId="3xN3mbIMb4CwtrZqlRbYyu">
      <Head>
        <meta
          name="google-site-verification"
          content="g7Ag5vgmFrmumUxVok2GYLriMQ1x0Ba-qbC26445h0I"
        />
      </Head>
      <PageMeta title="Refuge Worldwide" path="/" />

      {/* <NextUp /> */}

      <FeaturedShows shows={featuredShows} />

      <FeaturedArticles articles={featuredArticles} />

      <LatestNews articles={latestArticles} />
    </Layout>
  );
}
