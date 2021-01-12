import { Content } from "../lib/api";

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
  content: Content;
}
