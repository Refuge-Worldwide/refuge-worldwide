import * as CFRichTextTypes from "@contentful/rich-text-types";
import * as Contentful from "contentful";

export interface TypeSectionTodayFields {
  internal?: Contentful.EntryFields.Symbol;
  header: Contentful.EntryFields.Symbol;
  content: CFRichTextTypes.Block | CFRichTextTypes.Inline;
}

export type TypeSectionToday = Contentful.Entry<TypeSectionTodayFields>;
