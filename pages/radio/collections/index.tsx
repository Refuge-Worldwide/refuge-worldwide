import { InferGetStaticPropsType } from "next";
import Layout from "../../../components/layout";
import PageMeta from "../../../components/seo/page";
import { getCollections } from "../../../lib/contentful/pages/radio";
import Pill from "../../../components/pill";
import CollectionPreview from "../../../components/collectionPreview";
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
        <div className="h-5 sm:h-8" />

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 sm:gap-8">
          {collections.map((collection, i) => (
            <li key={i}>
              <CollectionPreview {...collection} />
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
