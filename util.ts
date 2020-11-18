import { ArtistInterface } from "./types/shared";

interface PageResponse {
  data: {
    [key: string]: any;
  };
}

export const extractPage = (fetchResponse: PageResponse, key: string) =>
  fetchResponse?.data?.[key];

interface CollectionResponse {
  data: {
    [key: string]: {
      items: any[];
    };
  };
}

export const extractCollection = (
  fetchResponse: CollectionResponse,
  key: string
) => fetchResponse?.data?.[key]?.items;

export const extractCollectionItem = (
  fetchResponse: CollectionResponse,
  key: string
) => fetchResponse?.data?.[key]?.items?.[0];

export const sortAndGroup = (
  data: ArtistInterface[]
): {
  alphabet: string;
  artists: ArtistInterface[];
}[] =>
  Object.values(
    data.reduce((accumulator, current) => {
      let alphabet = current.name[0];

      if (!accumulator[alphabet]) {
        accumulator[alphabet] = {
          alphabet,
          artists: [current],
        };
      } else {
        accumulator[alphabet].artists.push(current);
      }

      return accumulator;
    }, {})
  );
