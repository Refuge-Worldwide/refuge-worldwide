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

interface LinkedFromCollectionResponse<T = any> {
  data: {
    [key: string]: {
      items: {
        linkedFrom: {
          [key: string]: {
            items: T[];
          };
        };
      }[];
    };
  };
}

export const extractLinkedFromCollection = <T>(
  fetchResponse: LinkedFromCollectionResponse<T>,
  key: string,
  linkedFromKey: string
): T[] =>
  fetchResponse.data[key].items.flatMap(
    (item) => item.linkedFrom[linkedFromKey].items
  );

export const extractCollectionItem = <T>(
  fetchResponse: CollectionResponse,
  key: string
): T => fetchResponse?.data?.[key]?.items?.[0];

interface GroupedArtists {
  alphabet: string;
  artists: AllArtistEntry[];
}

export const sortAndGroup = (data: AllArtistEntry[]): GroupedArtists[] => {
  const alphaReducer = (
    accumulator: {
      [key: string]: {
        alphabet: string;
        artists: AllArtistEntry[];
      };
    },
    current: AllArtistEntry
  ) => {
    /**
     * @note Fix for names that have a lowercase letter as the first character as well as those with accents in their names
     */
    let alphabet = current.name
      .trim()[0]
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (REGEX.SPECIAL.test(alphabet) || REGEX.NUMERIC.test(alphabet))
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

  return Object.values(data.reduce(alphaReducer, {})).sort(sortHashtagToEnd);
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

export const __SERVER__ = typeof window === "undefined";

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

export const uniq = <T>(arr: T[]) => Array.from(new Set(arr));
