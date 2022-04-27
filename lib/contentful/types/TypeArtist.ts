import * as CFRichTextTypes from "@contentful/rich-text-types";
import * as Contentful from "contentful";

export interface TypeArtistFields {
  internal?: Contentful.EntryFields.Symbol;
  name: Contentful.EntryFields.Symbol;
  role: Contentful.EntryFields.Boolean;
  slug: Contentful.EntryFields.Symbol;
  photo: Contentful.Asset;
  coverImagePosition: "top" | "center" | "bottom";
  content?: CFRichTextTypes.Block | CFRichTextTypes.Inline;
}

export type TypeArtist = Contentful.Entry<TypeArtistFields>;
