import type { Document } from "@contentful/rich-text-types";
import type { CoverImage } from "./shared";

export type CoverImagePosition = "top" | "center" | "bottom";

export interface CoverImage {
  sys: { id: string };
  title: string;
  description: string;
  url: string;
  width: number;
  height: number;
}

export interface Asset {
  sys: { id: string };
  contentType: string;
  title: string;
  description: string;
  url: string;
  width: number;
  height: number;
}

export interface Links {
  assets: {
    block: Asset[];
  };
}

export interface Content {
  json: Document;
  links?: Links;
}

export interface ArtistInterface {
  sys: { id: string };
  name: string;
  slug: string;
  photo: CoverImage;
  coverImagePosition: CoverImagePosition;
  isResident: boolean;
  content?: Content;
}

export type ArtistEntry = {
  sys: { id: string };
  name: string;
  slug: string;
  photo: CoverImage;
  coverImagePosition: CoverImagePosition;
  content?: Content;
  linkedFrom?: { showCollection: { items: ShowInterface[] | [] } };
};

export type AllArtistEntry = {
  name: string;
  slug: string;
  isResident: boolean;
  photo: CoverImage;
};

export type ArtistFilterType = "All" | "Residents" | "Guests";

export interface GenreInterface {
  sys: {
    id: string;
  };
  name: string;
}

export interface ShowInterface {
  sys: {
    id: string;
  };
  mixcloudLink: string;
  title: string;
  date: string;
  slug: string;
  coverImage: CoverImage;
  coverImagePosition: CoverImagePosition;
  isFeatured: boolean;
  artistsCollection: {
    items: ArtistInterface[];
  };
  genresCollection: {
    items: GenreInterface[];
  };
  content: Content;
}

export enum ArticleType {
  Project = "Project",
  Blog = "Blog",
  News = "News",
  Event = "Event",
  Interview = "Interview",
}

export interface ArticleInterface {
  title: string;
  subtitle?: string;
  articleType: ArticleType;
  author?: {
    name: string;
  };
  date: string;
  slug: string;
  coverImage: CoverImage;
  coverImagePosition: CoverImagePosition;
  content: Content;
}

export interface AboutPageData {
  coverImage: CoverImage;
  content: Content;
}

export interface NextUpSection {
  content: Content;
}

export type HomePageData = {
  featuredShowsCollection: {
    items: Array<ShowPreviewEntry>;
  };
};

type ShowPreviewEntry = {
  coverImage: CoverImage;
  date: string;
  genresCollection: {
    items: GenreInterface[];
  };
  mixcloudLink: string;
  slug: string;
  title: string;
};

export interface NewsletterPageData {
  coverImage: CoverImage;
  content: Content;
}

export interface SupportPageData {
  coverImage: CoverImage;
  content: Content;
}

export type ErrorPayloadMessage = {
  message: string;
  extensions: {
    contentful: {
      code: string;
      requestId: string;
      details: {
        maximumCost: number;
        cost: number;
      };
    };
  };
};

export type ErrorPayload = {
  errors: ErrorPayloadMessage[];
};

export type BookingsPageData = {
  bookingPassword: string;
};
