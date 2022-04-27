import * as CFRichTextTypes from "@contentful/rich-text-types";
import * as Contentful from "contentful";

export interface TypePageSupportFields {
  internal?: Contentful.EntryFields.Symbol;
  coverImage: Contentful.Asset;
  content: CFRichTextTypes.Block | CFRichTextTypes.Inline;
}

export type TypePageSupport = Contentful.Entry<TypePageSupportFields>;
