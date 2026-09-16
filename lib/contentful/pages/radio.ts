import dayjs from "dayjs";
import { graphql } from "..";
import {
  GenreInterface,
  ShowInterface,
  PastShowSchema,
} from "../../../types/shared";
import {
  extractCollection,
  extractCollectionItem,
  placeholderImage,
} from "../../../util";

export const RADIO_SHOWS_PAGE_SIZE = 20;

export async function getRadioPageSingle(slug: string, preview: boolean) {
  const RadioPageSingleQuery = /* GraphQL */ `
    query RadioPageSingleQuery($slug: String, $preview: Boolean) {
      showCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
        items {
          sys {
            id
          }
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
          audioFile {
            sys {
              id
            }
            title
            description
            url
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

  if (!entry.coverImage) {
    entry.coverImage = placeholderImage;
  }

  console.log(entry.genresCollection);

  const genres = entry.genresCollection.items.map((genre) => genre?.name);

  const relatedShows = await getRelatedShows(slug, genres, 7, 0);

  return {
    show: entry,
    relatedShows,
  };
}

export async function getRadioPageById(id: string, preview: boolean) {
  const RadioPageByIdQuery = /* GraphQL */ `
    query RadioPageByIdQuery($id: String!, $preview: Boolean) {
      show(id: $id, preview: $preview) {
        sys {
          id
        }
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
        audioFile {
          sys {
            id
          }
          title
          description
          url
        }
      }
    }
  `;

  const res = await graphql(RadioPageByIdQuery, {
    variables: { id, preview },
    preview,
  });

  const entry = res?.data?.show as ShowInterface | null;

  if (!entry) {
    throw new Error(`No Show found for id '${id}'`);
  }

  if (!entry.coverImage) {
    entry.coverImage = placeholderImage;
  }

  console.log(entry.genresCollection);

  const genres = entry.genresCollection.items.map((genre) => genre?.name);

  const relatedShows = await getRelatedShows(entry.slug, genres, 7, 0);

  return {
    show: entry,
    relatedShows,
  };
}

export type UpcomingShowType = Pick<
  ShowInterface,
  | "sys"
  | "title"
  | "date"
  | "slug"
  | "coverImage"
  | "artistsCollection"
  | "genresCollection"
>;

export async function getUpcomingShows(
  preview?: boolean,
  date?: string,
  limit = 99
) {
  const today = dayjs(date ? date : undefined)
    .add(1, "day")
    .format("YYYY-MM-DD");

  const UpcomingShowsQuery = /* GraphQL */ `
    query UpcomingShowsQuery($preview: Boolean, $today: DateTime, $limit: Int) {
      showCollection(
        order: date_ASC
        where: {
          date_gt: $today
          artistsCollection_exists: true
          coverImage_exists: true
          isFeatured: true
        }
        preview: $preview
        limit: $limit
      ) {
        items {
          sys {
            id
          }
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
    variables: { preview, today, limit },
    preview,
  });

  return extractCollection<UpcomingShowType>(res, "showCollection");
}

export async function getAllGenres() {
  const AllGenresQuery = /* GraphQL */ `
    query AllGenresQuery($skip: Int!) {
      genreCollection(limit: 1000, skip: $skip, order: name_ASC) {
        total
        items {
          sys {
            id
          }
          name
        }
      }
    }
  `;

  // Contentful caps any single collection request at 1000 items, so loop
  // through pages in case the genre count ever grows past that.
  const genres: GenreInterface[] = [];
  let skip = 0;

  while (true) {
    const res = await graphql(AllGenresQuery, { variables: { skip } });
    const { items, total } = res.data.genreCollection;
    genres.push(...items);
    skip += items.length;
    if (items.length === 0 || skip >= total) break;
  }

  return genres;
}

export type RelatedShowsType = Pick<
  ShowInterface,
  | "sys"
  | "slug"
  | "title"
  | "coverImage"
  | "date"
  | "genresCollection"
  | "mixcloudLink"
>;

// Interpolates genre ids directly rather than passing them as a variable:
// Contentful's generated AND/filter input types are per-content-type and not
// worth referencing generically here. Callers must validate ids are safe
// (alphanumeric) before passing them in.
const relatedShowsTierQuery = (genreIds: string[]) => {
  const genreAndClause = genreIds
    .map((id) => `{ genres: { sys: { id: "${id}" } } }`)
    .join(", ");

  return /* GraphQL */ `
    query RelatedShowsTierQuery(
      $limit: Int
      $excludeSlugs: [String]
      $now: DateTime
    ) {
      showCollection(
        where: {
          AND: [${genreAndClause}]
          slug_not_in: $excludeSlugs
          mixcloudLink_exists: true
          date_lt: $now
        }
        order: [date_DESC, title_ASC]
        limit: $limit
      ) {
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
          genresCollection(limit: 3) {
            items {
              name
            }
          }
          sys {
            id
          }
        }
      }
    }
  `;
};

export async function getRelatedShows(
  slug: string,
  genres: string[],
  limit: number,
  skip: number
) {
  if (genres.length === 0) return [];

  const now = dayjs().toISOString();

  // Look up genre ids first, since Contentful's GraphQL API can't filter
  // showCollection by genre name directly (only by reference/id). Preserve
  // the show's own genre order so tiers below drop the least-primary genre
  // first.
  const genreIdsQuery = /* GraphQL */ `
    query genreIdsQuery($genres: [String]) {
      genreCollection(where: { name_in: $genres }) {
        items {
          name
          sys {
            id
          }
        }
      }
    }
  `;

  const genreIdsRes = await graphql(genreIdsQuery, {
    variables: { genres },
  });

  const nameToId = new Map<string, string>(
    genreIdsRes.data.genreCollection.items
      .filter(
        (genre) =>
          genre?.name && genre?.sys?.id && /^[a-zA-Z0-9]+$/.test(genre.sys.id)
      )
      .map((genre) => [genre.name, genre.sys.id])
  );

  const genreIds = genres
    .map((name) => nameToId.get(name))
    .filter((id): id is string => Boolean(id));

  if (genreIds.length === 0) return [];

  const targetCount = skip + limit;
  const collected: {
    id: string;
    title: string;
    date: string;
    slug: string;
    mixcloudLink: string;
    coverImage: string;
    genres: string[];
  }[] = [];
  const excludeSlugs = [slug];

  // Most relevant tier first: shows sharing ALL of this show's genres, then
  // all but the last one, then all but the last two, and so on down to a
  // single shared genre - each tier ordered by recency, higher tiers always
  // ranked above lower ones.
  for (
    let tierSize = genreIds.length;
    tierSize >= 1 && collected.length < targetCount;
    tierSize--
  ) {
    const tierIds = genreIds.slice(0, tierSize);

    const res = await graphql(relatedShowsTierQuery(tierIds), {
      variables: {
        limit: targetCount - collected.length,
        excludeSlugs,
        now,
      },
    });

    const items: RelatedShowsType[] = res.data.showCollection.items;

    for (const show of items) {
      collected.push({
        id: show.sys.id,
        title: show.title,
        date: show.date,
        slug: show.slug,
        mixcloudLink: show.mixcloudLink,
        coverImage: show.coverImage?.url
          ? show.coverImage.url
          : placeholderImage.url,
        genres: show.genresCollection.items
          .map((genre) => genre?.name)
          .filter(Boolean),
      });
      excludeSlugs.push(show.slug);
    }
  }

  // Preserve prior behavior of always showing at most 6 related shows,
  // regardless of the buffer requested via `limit`.
  return collected.slice(skip, skip + limit).slice(0, 6);
}

// to do: add show status prop confirmed/submitted
export async function getUpcomingShowsByDate(
  date,
  preview: boolean,
  status = "Confirmed"
) {
  const s = date.startOf("day").add(5, "hour");
  const e = s.add(1, "day");
  const start = s.toISOString();
  const end = e.toISOString();

  console.log(start);
  console.log(end);

  const UpcomingShowsByDateQuery = /* GraphQL */ `
    query upcomingShowsByDateQuery(
      $start: DateTime
      $end: DateTime
      $preview: Boolean
      $status: String
    ) {
      showCollection(
        order: date_ASC
        where: {
          date_gte: $start
          dateEnd_lte: $end
          dateEnd_exists: true
          status: $status
        }
        preview: $preview
        limit: 50
      ) {
        items {
          sys {
            id
          }
          title
          type
          date
          dateEnd
          slug
          coverImage {
            sys {
              id
            }
            url
          }
          sys {
            id
          }
          artistsCollection(limit: 9) {
            items {
              sys {
                id
              }
              name
              slug
              email
            }
          }
          artwork {
            sys {
              id
            }
            url
          }
        }
      }
    }
  `;

  const res = await graphql(UpcomingShowsByDateQuery, {
    variables: { start, end, preview, status },
    preview,
  });
  return extractCollection<ShowInterface>(res, "showCollection");
}
