import type * as CFRichTextTypes from "@contentful/rich-text-types";
import type * as Contentful from "contentful";

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

export interface TypeAuthorFields {
  internal: Contentful.EntryFields.Symbol;
  name: Contentful.EntryFields.Symbol;
}

export type TypeAuthor = Contentful.Entry<TypeAuthorFields>;

export interface TypeGenreFields {
  name: Contentful.EntryFields.Symbol;
  slug?: Contentful.EntryFields.Symbol;
}

export type TypeGenre = Contentful.Entry<TypeGenreFields>;

export interface TypePageAboutFields {
  internal?: Contentful.EntryFields.Symbol;
  coverImage: Contentful.Asset;
  content: CFRichTextTypes.Block | CFRichTextTypes.Inline;
}

export type TypePageAbout = Contentful.Entry<TypePageAboutFields>;

export interface TypePageBookingFields {
  internal: Contentful.EntryFields.Symbol;
  bookingPassword?: Contentful.EntryFields.Symbol;
}

export type TypePageBooking = Contentful.Entry<TypePageBookingFields>;

export interface TypePageHomeFields {
  internal: Contentful.EntryFields.Symbol;
  featuredShows: Contentful.Entry<TypeShowFields>[];
}

export type TypePageHome = Contentful.Entry<TypePageHomeFields>;

export interface TypePageNewsletterFields {
  internal?: Contentful.EntryFields.Symbol;
  coverImage: Contentful.Asset;
  content: CFRichTextTypes.Block | CFRichTextTypes.Inline;
}

export type TypePageNewsletter = Contentful.Entry<TypePageNewsletterFields>;

export interface TypePageSupportFields {
  internal?: Contentful.EntryFields.Symbol;
  coverImage: Contentful.Asset;
  content: CFRichTextTypes.Block | CFRichTextTypes.Inline;
}

export type TypePageSupport = Contentful.Entry<TypePageSupportFields>;

export interface TypeSectionHeroFields {
  internal: Contentful.EntryFields.Symbol;
  entries: Contentful.Entry<TypeArticleFields | TypeShowFields>[];
}

export type TypeSectionHero = Contentful.Entry<TypeSectionHeroFields>;

export interface TypeSectionTodayFields {
  internal?: Contentful.EntryFields.Symbol;
  header: Contentful.EntryFields.Symbol;
  content: CFRichTextTypes.Block | CFRichTextTypes.Inline;
}

export type TypeSectionToday = Contentful.Entry<TypeSectionTodayFields>;

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
