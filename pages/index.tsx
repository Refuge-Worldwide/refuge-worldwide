import HeroCarousel from "../components/heroCarousel";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import {
  getFeaturedArticles,
  getFeaturedShows,
  getHeroSection,
  getLatestArticles,
  getNextUpSection,
} from "../lib/api";
import {
  ArticleInterface,
  HeroSection,
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
  hero: HeroSection;
}

export default function HomePage({
  preview,
  featuredShows,
  latestArticles,
  featuredArticles,
  nextUp,
  hero,
}: Page) {
  return (
    <Layout preview={preview}>
      <PageMeta title="Refuge Worldwide" path="/" />

      <NextUp {...nextUp} />

      <HeroCarousel {...hero} />

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
      hero: await getHeroSection(preview),
      nextUp: await getNextUpSection(preview),
    },
  };
}
