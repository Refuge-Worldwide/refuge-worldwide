import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Block, BLOCKS, INLINES, Inline } from "@contentful/rich-text-types";
import Image from "next/image";
import { Asset, Entry, Content } from "../types/shared";
import Link from "next/link";
import { ArticleShowPreview } from "../components/showPreview";
interface EmbeddedAssetBlock extends Block {
  data: {
    target: {
      sys: {
        id: string;
      };
    };
  };
}

const getAssetById = (id: string, assets: Asset[]) =>
  assets.filter((asset) => asset.sys.id === id).pop();

const getEntryById = (id: string, assets: Entry[]) =>
  assets.filter((asset) => asset.sys.id === id).pop();

export function renderRichTextWithImages(content: Content) {
  if (content.links) {
    const blockAssets = content.links.assets.block;
    const blockEntries = content.links?.entries?.block;

    return documentToReactComponents(content.json, {
      renderNode: {
        [INLINES.HYPERLINK]: function InlineHyperlink(node: Inline, children) {
          const uri = node.data.uri as string;

          if (uri.includes("mixcloud.com/widget")) {
            return <iframe width="100%" height="120" src={uri} />;
          }

          if (uri.includes("refugeworldwide.com")) {
            return (
              <Link href={uri.replace("https://refugeworldwide.com", "")}>
                {children}
              </Link>
            );
          }

          return <a href={uri}>{children}</a>;
        },
        [BLOCKS.EMBEDDED_ENTRY]: (node, children) => {
          // find the entry in the entryMap by ID
          const id = node.data.target.sys.id;

          const entry = getEntryById(id, blockEntries);

          // render the entries as needed by looking at the __typename
          // referenced in the GraphQL query
          if (entry.__typename === "Show") {
            return <ArticleShowPreview {...entry} />;
          }
        },
        [BLOCKS.EMBEDDED_ASSET]: function EmbeddedAsset(
          node: EmbeddedAssetBlock
        ) {
          const id = node.data.target.sys.id;

          const asset = getAssetById(id, blockAssets);

          if (asset.contentType.includes("image")) {
            return (
              <Image
                src={asset.url}
                alt={asset.title}
                width={820}
                height={520}
                className="object-contain object-center"
              />
            );
          }

          return null;
        },
      },
    });
  }

  return documentToReactComponents(content.json);
}
