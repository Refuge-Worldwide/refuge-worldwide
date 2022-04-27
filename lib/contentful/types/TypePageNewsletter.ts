import * as CFRichTextTypes from "@contentful/rich-text-types";
import * as Contentful from "contentful";

export interface TypePageNewsletterFields {
  internal?: Contentful.EntryFields.Symbol;
  coverImage: Contentful.Asset;
  content: CFRichTextTypes.Block | CFRichTextTypes.Inline;
}

export type TypePageNewsletter = Contentful.Entry<TypePageNewsletterFields>;
