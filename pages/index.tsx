import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import {
  getFeaturedArticles,
  getFeaturedShows,
  getLatestArticles,
  getNextUpSection,
} from "../lib/api";
import {
  ArticleInterface,
  NextUpSection,
  ShowInterface,
} from "../types/shared";
import FeaturedShows from "../views/home/featuredShows";
import LatestNews from "../views/home/latestNews";
import NextUp from "../views/home/nextUp";
import FeaturedArticles from "../views/news/featuredArticles";

interface Page extends JSX.Element {
  preview: boolean;
  featuredShows: ShowInterface[];
  latestArticles: ArticleInterface[];
  featuredArticles: ArticleInterface[];
  nextUp: NextUpSection;
}

export default function HomePage({
  preview,
  featuredShows,
  latestArticles,
  featuredArticles,
  nextUp,
}: Page) {
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

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      featuredShows: await getFeaturedShows(preview),
      latestArticles: await getLatestArticles(preview),
      featuredArticles: await getFeaturedArticles(preview),
      nextUp: await getNextUpSection(preview),
    },
    revalidate: 60,
  };
}
