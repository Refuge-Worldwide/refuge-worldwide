import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import {
  Block,
  BLOCKS,
  INLINES,
  Inline,
  Document,
} from "@contentful/rich-text-types";
// Utility to slugify heading text for anchor ids
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Extract all h5 headings from Contentful rich text JSON
export function extractH5Headings(
  doc: Document
): Array<{ text: string; id: string }> {
  const headings: Array<{ text: string; id: string }> = [];
  function traverse(node: any) {
    if (node.nodeType === BLOCKS.HEADING_5) {
      const text = node.content.map((c: any) => c.value).join(" ");
      const id = slugify(text);
      headings.push({ text, id });
    }
    if (node.content) {
      node.content.forEach(traverse);
    }
  }
  traverse(doc);
  return headings;
}
import Image from "next/image";
import { Asset, Entry, Content } from "../types/shared";
import Link from "next/link";
import { ArticleShowPreview } from "../components/showPreview";
import Pill from "../components/pill";
import { useEffect, useState } from "react";
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

export function RenderRichTextWithImages(
  content: Content,
  toc: boolean = false
) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const scriptTag = document.createElement("script");
    scriptTag.src = "https://tally.so/widgets/embed.js";
    scriptTag.addEventListener("load", () => setLoaded(true));
    document.body.appendChild(scriptTag);
  }, []);

  if (content.links) {
    const blockAssets = content.links.assets.block;
    const blockEntries = content.links?.entries?.block;

    return documentToReactComponents(content.json, {
      renderNode: {
        [BLOCKS.HEADING_5]: (node, children) => {
          const text = node.content.map((c: any) => c.value).join(" ");
          if (toc) {
            const id = slugify(text);
            return (
              <h5 id={id} style={{ scrollMarginTop: "96px" }}>
                {children}
              </h5>
            );
          } else {
            return <h5>{children}</h5>;
          }
        },
        [INLINES.HYPERLINK]: function InlineHyperlink(node: Inline, children) {
          let uri = node.data.uri as string;

          if (uri.includes("mixcloud.com/widget")) {
            return <iframe width="100%" height="120" src={uri} />;
          }

          if (
            uri.includes("youtube-nocookie.com/embed") ||
            uri.includes("youtube.com/embed") ||
            uri.includes("player.vimeo.com") ||
            uri.includes("bandcamp.com/EmbeddedPlayer")
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
            const url = new URL(uri);
            const params = url.searchParams;

            if (!params.has("hideTitle")) params.append("hideTitle", "1");
            if (!params.has("transparentBackground"))
              params.append("transparentBackground", "1");
            if (!params.has("dynamicHeight"))
              params.append("dynamicHeight", "1");

            uri = url.toString();

            return (
              <div className="max-w-[750px] mx-auto">
                <iframe
                  data-tally-src={uri}
                  width="100%"
                  height="auto"
                  title="Application form"
                ></iframe>
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
