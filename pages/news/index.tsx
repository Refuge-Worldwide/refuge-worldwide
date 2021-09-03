import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import Pill from "../../components/pill";
import PageMeta from "../../components/seo/page";
import { getNewsPage } from "../../lib/api/pages";
import AllArticles from "../../views/news/allArticles";
import FeaturedArticles from "../../views/news/featuredArticles";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getNewsPage(preview)),
    },
    revalidate: 60,
  };
}

export default function NewsPage({
  articles,
  featuredArticles,
  preview,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="News | Refuge Worldwide" path="news/" />

      <FeaturedArticles articles={featuredArticles} />

      <section className="block sm:hidden px-4 pt-4 border-t-2">
        <Pill>
          <h1>News</h1>
        </Pill>
      </section>

      <AllArticles articles={articles} />
    </Layout>
  );
}
