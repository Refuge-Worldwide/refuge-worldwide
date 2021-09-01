import dayjs from "dayjs";
import { REGEX } from "./constants";
import {
  AllArtistEntry,
  ArtistFilterType,
  ArtistInterface,
  GenreInterface,
  ShowInterface,
} from "./types/shared";

interface PageResponse {
  data: {
    [key: string]: any;
  };
}

export const extractPage = <T>(fetchResponse: PageResponse, key: string): T =>
  fetchResponse?.data?.[key];

interface CollectionResponse {
  data: {
    [key: string]: {
      items: any[];
    };
  };
}

export const extractCollection = <T>(
  fetchResponse: CollectionResponse,
  key: string
): T[] => fetchResponse?.data?.[key]?.items;

interface LinkedFromCollectionResponse {
  data: Record<
    string,
    {
      linkedFrom: Record<
        string,
        {
          items: any[];
        }
      >;
    }
  >;
}

export const extractLinkedFromCollection = <T>(
  fetchResponse: LinkedFromCollectionResponse,
  key: string,
  linkedFromKey: string
): T[] => fetchResponse?.data?.[key]?.linkedFrom?.[linkedFromKey]?.items;

export const extractCollectionItem = <T>(
  fetchResponse: CollectionResponse,
  key: string
): T => fetchResponse?.data?.[key]?.items?.[0];

interface GroupedArtists {
  alphabet: string;
  artists: AllArtistEntry[];
}

export const sortAndGroup = (
  data: AllArtistEntry[],
  role: ArtistFilterType
): GroupedArtists[] => {
  const residencyFilter = (artist: AllArtistEntry) => {
    if (role === "All") return artist;
    if (role === "Residents" && artist.isResident === true) return artist;
    if (role === "Guests" && artist.isResident === false) return artist;
  };

  const alphaReducer = (
    accumulator: {
      [key: string]: {
        alphabet: string;
        artists: AllArtistEntry[];
      };
    },
    current: AllArtistEntry
  ) => {
    let alphabet = current.name[0];

    if (REGEX.NUMERIC.test(alphabet) || REGEX.SPECIAL.test(alphabet))
      alphabet = "#";

    if (!accumulator[alphabet]) {
      accumulator[alphabet] = {
        alphabet,
        artists: [current],
      };
    } else {
      accumulator[alphabet].artists.push(current);
    }

    return accumulator;
  };

  const sortHashtagToEnd = (a: GroupedArtists, b: GroupedArtists) => {
    if (a.alphabet === "#" || b.alphabet === "#") return -1;
    if (a.alphabet < b.alphabet) return -1;
    if (a.alphabet > b.alphabet) return 1;
    return 0;
  };

  return Object.values(
    data.filter(residencyFilter).reduce(alphaReducer, {})
  ).sort(sortHashtagToEnd);
};

export const formatArtistNames = (data: ArtistInterface[]) => {
  const names = data.map(({ name }) => name);

  if (names.length === 1) {
    return `With ${names[0]}`;
  }

  if (names.length === 2) {
    return `With ${names[0]} and ${names[1]}`;
  }

  if (names.length === 3) {
    return `With ${names.slice(0, 2).join(", ")} and ${names[3]}`;
  }

  return `With ${names.slice(0, 2).join(", ")} and others`;
};

export const getMixcloudKey = (url: string) =>
  url.replace("https://www.mixcloud.com", "");

export const isServer = typeof window === "undefined";

/**
 * Sorting functions for Arrays
 */
export const sort = {
  alpha: (a: string, b: string) =>
    a.localeCompare(b, "en", { sensitivity: "base" }),
  date_DESC: (a: ShowInterface, b: ShowInterface) =>
    dayjs(a.date).isAfter(b.date) ? -1 : 1,
  date_ASC: (a: ShowInterface, b: ShowInterface) =>
    dayjs(a.date).isBefore(b.date) ? -1 : 1,
};

export const delay = (time = 1500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const parseGenres = (genresCollection: { items: GenreInterface[] }) =>
  genresCollection.items
    .filter((genre) => Boolean(genre?.name))
    .map((genre) => genre.name)
    .sort(sort.alpha);
