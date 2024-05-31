import { InferGetStaticPropsType } from "next";
import Layout from "../../../components/layout";
import Pill from "../../../components/pill";
import PageMeta from "../../../components/seo/page";
import { getArchiveNewsPage } from "../../../lib/contentful/pages/news";
import ArchiveArticles from "../../../views/news/archiveArticles";
export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getArchiveNewsPage(preview, "ICYMI")),
    },
  };
}

export default function ICYMIArchivePage({
  articles,
  preview,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="ICYMI | Refuge Worldwide" path="news/" />

      <section className="block px-4 pt-4 sm:pt-8 sm:pl-8">
        <Pill>
          <h1>ICYMI</h1>
        </Pill>
      </section>

      <ArchiveArticles articles={articles} type="ICYMI" />
    </Layout>
  );
}
