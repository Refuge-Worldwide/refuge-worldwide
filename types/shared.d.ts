import { Content } from "../lib/api";

export type CoverImagePosition = "top" | "center" | "bottom";

export interface CoverImage {
  sys: { id: string };
  title: string;
  description: string;
  url: string;
  width: number;
  height: number;
}

export interface ArtistInterface {
  name: string;
  slug: string;
  photo: CoverImage;
  coverImagePosition: CoverImagePosition;
  isResident: boolean;
  content?: Content;
}

export type ArtistFilterType = "All" | "Residents" | "Guests";

export interface GenreInterface {
  name: string;
}

export interface ShowInterface {
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
  subtitle: string;
  articleType: ArticleType;
  date: string;
  slug: string;
  location: string;
  coverImage: CoverImage;
  coverImagePosition: CoverImagePosition;
  content: Content;
}
