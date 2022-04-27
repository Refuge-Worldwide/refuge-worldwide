import * as Contentful from "contentful";
import { TypeArticleFields } from "./TypeArticle";
import { TypeShowFields } from "./TypeShow";

export interface TypeSectionHeroFields {
  internal: Contentful.EntryFields.Symbol;
  entries: Contentful.Entry<TypeArticleFields | TypeShowFields>[];
}

export type TypeSectionHero = Contentful.Entry<TypeSectionHeroFields>;
