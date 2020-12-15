import Head from "next/head";
import Layout from "../../components/layout";
import Pill from "../../components/pill";
import { getAllArticles, getFeaturedArticles } from "../../lib/api";
import { ArticleInterface } from "../../types/shared";
import AllArticles from "../../views/news/allArticles";
import FeaturedArticle from "../../views/news/featuredArticles";

interface Page extends JSX.Element {
  preview: boolean;
  articles: ArticleInterface[];
  featuredArticles: ArticleInterface[];
}

export default function NewsPage({
  preview,
  articles,
  featuredArticles,
}: Page) {
  return (
    <Layout preview={preview}>
      <Head>
        <title>News</title>
      </Head>

      <FeaturedArticle articles={featuredArticles} />

      <section className="block sm:hidden px-4 pt-4 border-t-2">
        <Pill>
          <h1>News</h1>
        </Pill>
      </section>

      <AllArticles articles={articles} />
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      articles: await getAllArticles(preview),
      featuredArticles: await getFeaturedArticles(preview),
      preview,
    },
    revalidate: 60,
  };
}
