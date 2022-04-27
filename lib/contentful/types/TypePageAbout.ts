import * as CFRichTextTypes from "@contentful/rich-text-types";
import * as Contentful from "contentful";

export interface TypePageAboutFields {
  internal?: Contentful.EntryFields.Symbol;
  coverImage: Contentful.Asset;
  content: CFRichTextTypes.Block | CFRichTextTypes.Inline;
}

export type TypePageAbout = Contentful.Entry<TypePageAboutFields>;
