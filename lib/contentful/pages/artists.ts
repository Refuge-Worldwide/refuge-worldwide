import dayjs from "dayjs";
import { graphql } from "..";
import {
  AllArtistEntry,
  ArtistEntry,
  ShowInterface,
} from "../../../types/shared";
import { extractCollection, extractCollectionItem, sort } from "../../../util";
import { AllArtistFragment } from "../fragments";

export const ARTISTS_GUESTS_PAGE_SIZE = 50;

export async function getArtistsPage(
  role: boolean,
  limit: number,
  skip: number
) {
  const ArtistsPageQuery = /* GraphQL */ `
    query ArtistsPageQuery($limit: Int, $skip: Int, $role: Boolean) {
      artistCollection(
        order: name_ASC
        limit: $limit
        skip: $skip
        where: { role: $role }
      ) {
        items {
          ...AllArtistFragment
        }
      }
    }

    ${AllArtistFragment}
  `;

  const data = await graphql(ArtistsPageQuery, {
    variables: { limit, skip, role },
  });

  return extractCollection<AllArtistEntry>(data, "artistCollection");
}

export async function getArtistsPageSingle(slug: string, preview: boolean) {
  const today = dayjs();

  const ArtistsPageSingleQuery = /* GraphQL */ `
    query ArtistsPageSingleQuery($slug: String, $preview: Boolean) {
      artistCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
        items {
          sys {
            id
          }
          name
          slug
          photo {
            sys {
              id
            }
            title
            description
            url
            width
            height
          }
          coverImagePosition
          content {
            json
            links {
              assets {
                block {
                  sys {
                    id
                  }
                  contentType
                  title
                  description
                  url
                  width
                  height
                }
              }
            }
          }
          linkedFrom {
            showCollection(limit: 900) {
              items {
                slug
                title
                coverImage {
                  sys {
                    id
                  }
                  title
                  description
                  url
                  width
                  height
                }
                date
                genresCollection(limit: 9) {
                  items {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const entry = await graphql(ArtistsPageSingleQuery, {
    variables: { slug, preview },
    preview,
  });

  const artist = extractCollectionItem<ArtistEntry>(entry, "artistCollection");

  if (!artist) {
    throw new Error(`No Artist found for slug '${slug}'`);
  }

  let relatedShows: ShowInterface[] = [];

  const date_lt_TODAY = (show: ShowInterface) =>
    dayjs(show.date).isBefore(today);

  const linkedFrom = artist.linkedFrom.showCollection.items;

  const linkedFromFiltered = linkedFrom.filter(date_lt_TODAY);

  if (linkedFromFiltered.length > 0) {
    relatedShows = linkedFromFiltered.sort(sort.date_DESC);
  }

  return {
    artist,
    relatedShows,
  };
}
