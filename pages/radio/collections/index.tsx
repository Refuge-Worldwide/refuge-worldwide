import { InferGetStaticPropsType } from "next";
import Layout from "../../../components/layout";
import PageMeta from "../../../components/seo/page";
import { getCollections } from "../../../lib/contentful/pages/radio";
import Collections from "../../../components/collections";
import Pill from "../../../components/pill";
export async function getStaticProps({ preview = true }) {
  const collections = await getCollections(preview);

  return {
    props: {
      preview,
      collections,
    },
  };
}

export default function CollectionPage({
  preview,
  collections,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="Radio | Refuge Worldwide" path="radio/" />
      <div className="p-4 sm:p-8 min-h-[80vh]">
        <Pill>
          <h1>Collections</h1>
        </Pill>
        <Collections collections={collections} />
      </div>
    </Layout>
  );
}
