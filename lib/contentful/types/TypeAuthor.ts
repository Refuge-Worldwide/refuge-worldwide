import * as Contentful from "contentful";

export interface TypeAuthorFields {
  internal: Contentful.EntryFields.Symbol;
  name: Contentful.EntryFields.Symbol;
}

export type TypeAuthor = Contentful.Entry<TypeAuthorFields>;
