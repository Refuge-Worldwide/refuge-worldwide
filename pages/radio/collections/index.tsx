import { InferGetStaticPropsType } from "next";
import Layout from "../../../components/layout";
import PageMeta from "../../../components/seo/page";
import { getCollections } from "../../../lib/contentful/pages/radio";
import Pill from "../../../components/pill";
import CollectionPreview from "../../../components/collectionPreview";
import Carousel from "../../../components/carousel";
import CollectionsGrid from "../../../views/radio/collections/collectionsGrid";
import CollectionsTable from "../../../views/radio/collections/collectionsTable";
import * as Tabs from "@radix-ui/react-tabs";
import { CiGrid2H } from "react-icons/ci";
import { CiGrid41 } from "react-icons/ci";

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

      <Tabs.Root defaultValue="table">
        <div className="flex justify-between items-center p-4 sm:p-8 border-b-2 border-black">
          <Pill>
            <h1>Collections</h1>
          </Pill>
          <Tabs.List>
            <Tabs.Trigger value="table" className="group">
              <CiGrid2H className="group-data-[state=active]:bg-black group-data-[state=active]:fill-white rounded" />
            </Tabs.Trigger>
            <Tabs.Trigger value="grid" className="group">
              <CiGrid41 className="group-data-[state=active]:bg-black group-data-[state=active]:fill-white rounded" />
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        <Tabs.Content value="table">
          <CollectionsTable collections={collections} />
        </Tabs.Content>
        <Tabs.Content value="grid">
          <CollectionsGrid collections={collections} />
        </Tabs.Content>
      </Tabs.Root>
    </Layout>
  );
}
