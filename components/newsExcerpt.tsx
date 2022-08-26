import {
  documentToReactComponents,
  Options,
} from "@contentful/rich-text-react-renderer";
import { Document, INLINES } from "@contentful/rich-text-types";
import { Fragment } from "react";
import { Content } from "../types/shared";

const NewsExcerpt = ({ content }: { content: Content | undefined }) => {
  if (typeof content === "undefined" || typeof content?.json === "undefined") {
    return <Fragment>{"MISSING CONTENT"}</Fragment>;
  }

  const excerpt: Document = {
    ...content.json,
    content: content.json.content
      .filter((el) => el.nodeType === "paragraph")
      .slice(0, 1),
  };

  const richTextOptions: Options = {
    renderNode: {
      [INLINES.HYPERLINK]: (_, children) => children,
    },
  };

  return (
    <Fragment>{documentToReactComponents(excerpt, richTextOptions)}</Fragment>
  );
};

export default NewsExcerpt;
