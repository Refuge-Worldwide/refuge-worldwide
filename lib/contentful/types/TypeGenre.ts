import * as Contentful from "contentful";

export interface TypeGenreFields {
  name: Contentful.EntryFields.Symbol;
  slug?: Contentful.EntryFields.Symbol;
}

export type TypeGenre = Contentful.Entry<TypeGenreFields>;
