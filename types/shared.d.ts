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

export interface Entry {
  sys: { id: string };
  __typename: string;
  date: string;
  id: string;
  title: string;
  slug: string;
  coverImage: CoverImage;
  mixcloudLink: string;
}

export interface Links {
  assets: {
    block: Asset[];
  };
  entries?: {
    block: Entry[];
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
  email?: string;
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

export type DropdownArtistEntry = {
  sys: {
    id: string;
  };
  name: string;
};

export type CalendarDropdownArtistEntry = {
  sys: {
    id: string;
  };
  name: string;
  email: [string];
};

export type Dropdown = { value: string; label: string }[];

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
  dateEnd?: string;
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
  status?: string;
}

export type PastShowSchema = {
  date: string;
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  mixcloudLink: string;
  genres: string[];
};

export type ScheduleShow = {
  sys: {
    id: string;
  };
  title: string;
  localStartTime?: string;
  date: string;
  dateEnd: string;
  slug: string;
  coverImage: CoverImage;
  coverImagePosition: CoverImagePosition;
  artistsCollection: {
    items: ArtistInterface[];
  };
  live?: boolean;
};

export enum ArticleType {
  Project = "Project",
  Blog = "Blog",
  News = "News",
  Event = "Event",
  Interview = "Interview",
  Workshop = "Workshop",
}

export interface ArticleInterface {
  sys: {
    id: string;
  };
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

export interface ValuesPageData {
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

export type EventPageData = {
  featuredEventsCollection: {
    items: Array<EventInterface>;
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

export interface TourPageData {
  coverImage: CoverImage;
  content: Content;
}

export interface SubmissionPageData {
  coverImage: CoverImage;
  liveShows: Content;
  liveShows2: Content;
  preRecords: Content;
  uploadLink: string;
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

export type SubmissionFormValues = {
  id?: string;
  showType: string;
  readInfo: Boolean;
  email: string;
  number: string;
  showName: string;
  datetime: string;
  length: string;
  genres: Array<{ value: string; label: string }>;
  hasNewGenres: Boolean;
  newGenres: string;
  description: string;
  instagram: string;
  image: Array;
  additionalEq?: boolean;
  additionalEqDesc?: string;
  artists?: Array<{ value: string; label: string }>;
  hasExtraArtists: boolean;
  extraArtists?: Array<{
    name: string;
    pronouns: string;
    bio?: string;
    image?: string;
  }>;
};

export type EventType =
  | "Workshop"
  | "Party"
  | "Fundraiser"
  | "Hang out"
  | "Exhibition"
  | "Festival"
  | "Concert";
export interface EventInterface {
  title: string;
  coverImage?: CoverImage;
  eventType: EventType;
  date: string;
  endDate?: string;
  slug: string;
  location: string;
  ticketLink: string;
  linkText: string;
  article: Object<{ slug: string }>;
}

export interface WorkshopInterface {
  title: string;
  slug: string;
  coverImage?: CoverImage;
  content: Content;
  tallyFormLink: string;
}

export type SubmissionImportantInfo = {
  liveShows: Content;
  liveShows2: Content;
  preRecords: Content;
};
