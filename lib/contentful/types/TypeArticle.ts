import * as CFRichTextTypes from "@contentful/rich-text-types";
import * as Contentful from "contentful";
import { TypeAuthorFields } from "./TypeAuthor";

export interface TypeArticleFields {
  internal?: Contentful.EntryFields.Symbol;
  coverImage: Contentful.Asset;
  coverImagePosition: "top" | "center" | "bottom";
  title: Contentful.EntryFields.Symbol;
  subtitle?: Contentful.EntryFields.Symbol;
  author: Contentful.Entry<TypeAuthorFields>;
  articleType?: "Project" | "Blog" | "News" | "Event" | "Interview";
  slug: Contentful.EntryFields.Symbol;
  isFeatured?: Contentful.EntryFields.Boolean;
  date: Contentful.EntryFields.Date;
  content: CFRichTextTypes.Block | CFRichTextTypes.Inline;
}

export type TypeArticle = Contentful.Entry<TypeArticleFields>;
