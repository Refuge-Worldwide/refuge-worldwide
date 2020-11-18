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
