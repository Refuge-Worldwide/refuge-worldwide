import dayjs from "dayjs";
import { REGEX } from "./constants";
import {
  AllArtistEntry,
  ArtistInterface,
  GenreInterface,
  ShowInterface,
  PastShowSchema,
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
  // remove null artists who are unpublished on a published show
  const filteredData = data.filter((artist) => artist !== null);
  const names = filteredData.map(({ name }) => name);

  if (names.length === 1) {
    return `with ${names[0]}`;
  }

  if (names.length === 2) {
    return `with ${names[0]} and ${names[1]}`;
  }

  if (names.length === 3) {
    return `with ${names.slice(0, 2).join(", ")} and ${names[2]}`;
  }

  return `with ${names.slice(0, 2).join(", ")} and others`;
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
  date_DESC: (
    a: ShowInterface | PastShowSchema,
    b: ShowInterface | PastShowSchema
  ) => (dayjs(a.date).isAfter(b.date) ? -1 : 1),
  date_ASC: (
    a: ShowInterface | PastShowSchema,
    b: ShowInterface | PastShowSchema
  ) => (dayjs(a.date).isBefore(b.date) ? -1 : 1),
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
    .map((genre) => genre.name);

export const uniq = <T>(arr: T[]) => Array.from(new Set(arr));

export const transformForDropdown = (array) => {
  return array.map((item) => ({
    value: item.sys.id,
    label: item.name,
    // to do: remove sys and name from spread to reduce size of object
    ...item,
  }));
};

export const showArtworkURL = (values, useExtraArtists = false) => {
  const images = encodeURIComponent(
    values.image
      .map((img) => {
        return img.url;
      })
      .join(",")
  );
  const title = encodeURIComponent(values.showName);

  let formattedArtists = values.artists
    .map((x) => x.label)
    .join(", ")
    .replace(/, ([^,]*)$/, " & $1");

  if (useExtraArtists && values.hasExtraArtists) {
    console.log("using additional artists");
    const additionalArtists = values.extraArtists
      .map((x) => x.name)
      .join(", ")
      .replace(/, ([^,]*)$/, " & $1");

    formattedArtists = `${formattedArtists}, ${additionalArtists}`.replace(
      /, ([^,]*)$/,
      " & $1"
    );
  }

  formattedArtists = encodeURIComponent(formattedArtists);

  // Format the date and time
  const date = encodeURIComponent(
    `${dayjs(values.datetime).utc().format("ddd DD MMM / HH:mm")}-${dayjs(
      values.datetimeEnd
    )
      .utc()
      .format("HH:mm")} (CET)`
  );

  const colours = [
    "#cd46fd",
    "#fd339b",
    "#ff96ff",
    "#f94646",
    "#fe6301",
    "#ff9d1d",
    "#fffe49",
    "#defc32",
    "#b0b02b",
    "#00cb0d",
    "#32fe95",
    "#4ac8f4",
    "#ffa2b5",
    "#facc7f",
    "#99fffc",
    "#99e9ff",
    "#ab8dff",
    "#ffd9f0",
    "#fbffb3",
    "#ccffd1",
    "#ffedd9",
    "#ccd2ff",
  ];

  // Get the day of the month
  const dayOfMonth = dayjs(values.datetime).utc().date();

  // Get a color from the colours array based on the day of the month
  const colour = colours[dayOfMonth % colours.length];

  // Determine the base URL based on the environment
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "https://b04f-103-69-224-146.ngrok-free.app"
      : process.env.NEXT_PUBLIC_WEBSITE_URL;

  // Set URL for social image
  const url = `${baseUrl}/api/automated-artwork?title=${title}&artists=${formattedArtists}&date=${date}&images=${images}&colour=${encodeURIComponent(
    colour
  )}`;

  return url;
};
