import dayjs from "dayjs";
import { graphql } from "..";
import { GenreInterface, ShowInterface } from "../../../types/shared";
import {
  extractCollection,
  extractCollectionItem,
  extractLinkedFromCollection,
  sort,
} from "../../../util";

export const RADIO_SHOWS_PAGE_SIZE = 20;

export async function getRadioPageSingle(slug: string, preview: boolean) {
  const RadioPageSingleQuery = /* GraphQL */ `
    query RadioPageSingleQuery($slug: String, $preview: Boolean) {
      showCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
        items {
          title
          date
          slug
          mixcloudLink
          isFeatured
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
          coverImagePosition
          artistsCollection(limit: 9) {
            items {
              name
              slug
            }
          }
          genresCollection(limit: 9) {
            items {
              name
            }
          }
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
        }
      }
    }
  `;

  const res = await graphql(RadioPageSingleQuery, {
    variables: { slug, preview },
    preview,
  });

  const entry = extractCollectionItem<ShowInterface>(res, "showCollection");

  if (!entry) {
    throw new Error(`No Show found for slug '${slug}'`);
  }

  const genres = entry.genresCollection.items.map((genre) => genre.name);

  const relatedShows = await getRelatedShows(slug, genres, 3, 0);

  return {
    show: entry,
    relatedShows,
  };
}

export type UpcomingShowType = Pick<
  ShowInterface,
  | "title"
  | "date"
  | "slug"
  | "coverImage"
  | "artistsCollection"
  | "genresCollection"
>;

export async function getUpcomingShows(preview: boolean) {
  const today = dayjs().format("YYYY-MM-DD");

  const UpcomingShowsQuery = /* GraphQL */ `
    query UpcomingShowsQuery($preview: Boolean, $today: DateTime) {
      showCollection(
        order: date_ASC
        where: {
          date_gt: $today
          artistsCollection_exists: true
          coverImage_exists: true
          isFeatured: true
        }
        preview: $preview
        limit: 3
      ) {
        items {
          title
          date
          slug
          coverImage {
            sys {
              id
            }
            url
          }
          artistsCollection(limit: 9) {
            items {
              name
              slug
            }
          }
          genresCollection(limit: 3) {
            items {
              name
            }
          }
        }
      }
    }
  `;

  const res = await graphql(UpcomingShowsQuery, {
    variables: { preview, today },
    preview,
  });

  return extractCollection<UpcomingShowType>(res, "showCollection");
}

export type PastShowType = Pick<
  ShowInterface,
  | "sys"
  | "title"
  | "date"
  | "slug"
  | "coverImage"
  | "artistsCollection"
  | "genresCollection"
  | "mixcloudLink"
>;

export async function getPastShows(
  preview: boolean,
  limit: number,
  skip: number,
  filter?: string
) {
  if (typeof filter === "undefined" || filter === "All") {
    const today = dayjs().format("YYYY-MM-DD");

    const PastShowsQuery = /* GraphQL */ `
      query PastShowsQuery(
        $preview: Boolean
        $limit: Int
        $skip: Int
        $today: DateTime
      ) {
        showCollection(
          order: date_DESC
          where: {
            date_lte: $today
            coverImage_exists: true
            artistsCollection_exists: true
          }
          preview: $preview
          limit: $limit
          skip: $skip
        ) {
          items {
            sys {
              id
            }
            title
            date
            slug
            mixcloudLink
            coverImage {
              sys {
                id
              }
              url
            }
            artistsCollection(limit: 9) {
              items {
                name
                slug
              }
            }
            genresCollection(limit: 3) {
              items {
                sys {
                  id
                }
                name
              }
            }
          }
        }
      }
    `;

    const res = await graphql(PastShowsQuery, {
      variables: { preview, limit, today, skip },
      preview,
    });

    return extractCollection<PastShowType>(res, "showCollection");
  }

  const PastShowsQueryByGenre = /* GraphQL */ `
    query PastShowsQueryByGenre($genre: String, $limit: Int, $skip: Int) {
      genreCollection(where: { name: $genre }, limit: 1) {
        items {
          linkedFrom {
            showCollection(limit: $limit, skip: $skip) {
              items {
                title
                date
                slug
                mixcloudLink
                coverImage {
                  sys {
                    id
                  }
                  url
                }
                artistsCollection(limit: 9) {
                  items {
                    name
                    slug
                  }
                }
                genresCollection(limit: 3) {
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

  const res = await graphql(PastShowsQueryByGenre, {
    variables: { genre: filter, limit, skip },
    preview,
  });

  const linkedFromShows = extractLinkedFromCollection<PastShowType>(
    res,
    "genreCollection",
    "showCollection"
  );

  const filteredShows = linkedFromShows
    .filter((show) => dayjs(show.date).isBefore(dayjs()))
    .sort(sort.date_DESC);

  return filteredShows;
}

export async function getAllGenres() {
  const AllGenresQuery = /* GraphQL */ `
    query AllGenresQuery {
      genreCollection(limit: 1000) {
        items {
          sys {
            id
          }
          name
        }
      }
    }
  `;

  const res = await graphql(AllGenresQuery);

  return extractCollection<GenreInterface>(res, "genreCollection");
}

export type RelatedShowsType = Pick<
  ShowInterface,
  "slug" | "title" | "coverImage" | "date" | "genresCollection"
>;

export async function getRelatedShows(
  slug: string,
  genres: string[],
  limit: number,
  skip: number
) {
  const RelatedShowsQuery = /* GraphQL */ `
    query RelatedShowsQuery($limit: Int, $skip: Int, $genres: [String]) {
      genreCollection(where: { name_in: $genres }) {
        items {
          linkedFrom {
            showCollection(limit: $limit, skip: $skip) {
              items {
                title
                date
                slug
                coverImage {
                  sys {
                    id
                  }
                  url
                }
                genresCollection(limit: 2) {
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

  const res = await graphql(RelatedShowsQuery, {
    variables: { limit, genres, skip },
  });

  const linkedFromShows = extractLinkedFromCollection<RelatedShowsType>(
    res,
    "genreCollection",
    "showCollection"
  );

  const filteredShows = linkedFromShows
    .filter((show) => show.slug !== slug)
    .filter((show) => dayjs(show.date).isBefore(dayjs()))
    .sort(sort.date_DESC);

  return filteredShows;
}
