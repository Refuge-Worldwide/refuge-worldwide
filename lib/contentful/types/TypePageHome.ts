import * as Contentful from "contentful";
import { TypeShowFields } from "./TypeShow";

export interface TypePageHomeFields {
  internal: Contentful.EntryFields.Symbol;
  featuredShows: Contentful.Entry<TypeShowFields>[];
}

export type TypePageHome = Contentful.Entry<TypePageHomeFields>;
