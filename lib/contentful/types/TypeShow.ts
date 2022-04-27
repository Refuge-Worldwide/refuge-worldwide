import * as CFRichTextTypes from "@contentful/rich-text-types";
import * as Contentful from "contentful";
import { TypeArtistFields } from "./TypeArtist";
import { TypeGenreFields } from "./TypeGenre";

export interface TypeShowFields {
  internal?: Contentful.EntryFields.Symbol;
  mixcloudLink?: Contentful.EntryFields.Symbol;
  coverImage: Contentful.Asset;
  coverImagePosition: "top" | "center" | "bottom";
  title: Contentful.EntryFields.Symbol;
  slug: Contentful.EntryFields.Symbol;
  isFeatured?: Contentful.EntryFields.Boolean;
  date: Contentful.EntryFields.Date;
  artists: Contentful.Entry<TypeArtistFields>[];
  genres: Contentful.Entry<TypeGenreFields>[];
  content?: CFRichTextTypes.Block | CFRichTextTypes.Inline;
}

export type TypeShow = Contentful.Entry<TypeShowFields>;
