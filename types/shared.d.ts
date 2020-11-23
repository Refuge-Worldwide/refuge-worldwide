import type { Document } from "@contentful/rich-text-types";

export interface CoverImage {
  title: string;
  description: string;
  url: string;
  width: number;
  height: number;
}

export interface ImageInterface extends CoverImage {}

export interface ArtistInterface {
  name: string;
  slug: string;
  photo: ImageInterface;
}

export interface GenreInterface {
  name: string;
}

export interface ShowInterface {
  title: string;
  date: string;
  slug: string;
  location: string;
  coverImage: CoverImage;
  artistsCollection: {
    items: ArtistInterface[];
  };
  genresCollection: {
    items: GenreInterface[];
  };
  content: {
    json: Document;
  };
}

enum ArticleType {
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
  content: {
    json: Document;
  };
}
