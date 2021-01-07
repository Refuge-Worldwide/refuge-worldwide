import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Block, BLOCKS, Inline } from "@contentful/rich-text-types";
import Head from "next/head";
import Layout from "../components/layout";
import SinglePage from "../components/singlePage";
import { AboutPageData, Asset, getAboutPage, Links } from "../lib/api";

interface Page extends JSX.Element {
  preview: boolean;
  data: AboutPageData;
}

const getAssetById = (id: string, assets: Asset[]) =>
  assets.filter((asset) => asset.sys.id === id).pop();

const imagesFromEmbeddedAsset = (links: Links) => (node: Block | Inline) => {
  if (node.data.target.sys.id) {
    const id = node.data.target.sys.id;
    const assets = links.assets.block;

    const asset = getAssetById(id, assets);

    if (asset.contentType.includes("image"))
      return <img src={asset.url} alt={asset.title} />;

    return null;
  }

  return null;
};

export default function AboutPage({ preview, data }: Page) {
  const richText = documentToReactComponents(data?.content?.json, {
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: imagesFromEmbeddedAsset(data?.content?.links),
    },
  });

  return (
    <Layout preview={preview}>
      <Head>
        <title>About</title>
      </Head>

      <SinglePage coverImage={data.coverImage}>
        <div className="p-4 sm:p-8">
          <div className="container-md">
            <div className="prose sm:prose-lg max-w-none">{richText}</div>
          </div>
        </div>
      </SinglePage>
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      data: await getAboutPage(preview),
    },
  };
}
