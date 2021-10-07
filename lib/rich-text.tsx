import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Block, BLOCKS } from "@contentful/rich-text-types";
import Image from "next/image";
import { Asset, Content } from "../types/shared";

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
                width={asset.width}
                height={asset.height}
                layout="responsive"
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
