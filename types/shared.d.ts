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
  isResident: boolean;
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
  content: {
    json: Document;
  };
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
  content: {
    json: Document;
  };
}

export interface RadioCoInterface {
  status: "online" | "offline";
  source: {
    type: string;
    collaborator?: any;
    relay?: any;
  };
  collaborators: any[];
  relays: any[];
  current_track: {
    title: string;
    start_time: string;
    artwork_url: string;
    artwork_url_large: string;
  };
  history: { title: string }[];
  logo_url: string;
  streaming_hostname: string;
  outputs: {
    name: string;
    format: string;
    bitrate: number;
  }[];
}

export interface PlayerWidget {
  events: {
    buffering: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    ended: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    error: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    pause: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    play: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    progress: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
  };
  getCurrentKey: () => Promise<string>;
  getDuration: () => Promise<number>;
  getIsPaused: () => Promise<boolean>;
  getPosition: () => Promise<number>;
  getVolume: () => Promise<number>;
  pause: () => Promise<void>;
  play: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  ready: Promise<void>;
}
