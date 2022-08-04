import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Block, BLOCKS, INLINES, Inline } from "@contentful/rich-text-types";
import Image from "next/future/image";
import { Asset, Content } from "../types/shared";
import Link from "next/link";

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

export function renderRichTextWithImages(content: Content) {
  if (content.links) {
    const blockAssets = content.links.assets.block;

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
                <a>{children}</a>
              </Link>
            );
          }

          return <a href={uri}>{children}</a>;
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
