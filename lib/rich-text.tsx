import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Block, BLOCKS, INLINES, Inline } from "@contentful/rich-text-types";
import Image from "next/image";
import { Asset, Entry, Content } from "../types/shared";
import Link from "next/link";
import { ArticleShowPreview } from "../components/showPreview";
import Pill from "../components/pill";
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

          if (
            uri.includes("youtube-nocookie.com/embed") ||
            uri.includes("youtube.com/embed")
          ) {
            return (
              <div className="aspect-video">
                <iframe
                  title={children.toString()}
                  src={uri}
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  width="100%"
                  height="100%"
                  loading="lazy"
                ></iframe>
              </div>
            );
          }

          if (uri.includes("tally.so/embed")) {
            return (
              <div className="md:border md:p-8">
                <div className="max-w-[750px] mx-auto">
                  <Pill>
                    <h3 className="!text-small sm:!text-base !mt-0 !mb-0">
                      {children}
                    </h3>
                  </Pill>
                  <iframe
                    title="Application form"
                    src={uri}
                    width="100%"
                    height="1650"
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            );
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
                alt={asset.description}
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
