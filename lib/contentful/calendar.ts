import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import next from "next";
import { graphql } from ".";
import { extractCollection } from "../../util";
import { ArtistInterface } from "../../types/shared";
import { transformForDropdown } from "../../util";
import { CalendarDropdownArtistEntry } from "../../types/shared";
import { createClient } from "contentful-management";
import {
  formatArtistsForContenful,
  createReferencesArray,
} from "../../lib/contentful/management";
dayjs.extend(utc);

const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const client = createClient({
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
});
const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID;
const showContentTypeId = "show";
const artistContentTypeId = "artist";

interface CalendarShow {
  sys: {
    id: string;
    publishedVersion: string;
  };
  status: string;
  title: string;
  type: string;
  localStartTime?: string;
  date: string;
  dateEnd: string;
  slug: string;
  booker: string;
  mixcloudLink: string;
  artistsCollection: {
    items: ArtistInterface[];
  };
  coverImage: {
    url: string;
  };
  additionalImages: Array<string>;
}

interface fcCalendarShow {
  id: string;
  title: string;
  artists: Array<{ value: string; label: string }>;
  start: string;
  end: string;
  status: string;
  published: string;
  backgroundColor: string;
  borderColor: string;
  booker: string;
  mixcloudLink: string;
  images: Array<string>;
}

export async function getCalendarShows(start, end, preview: boolean) {
  const calendarQuery = /* GraphQL */ `
    query calendarQuery($start: DateTime, $end: DateTime, $preview: Boolean) {
      showCollection(
        order: date_ASC
        where: { date_gte: $start, dateEnd_lte: $end, dateEnd_exists: true }
        preview: $preview
        limit: 999
      ) {
        items {
          title
          type
          date
          dateEnd
          slug
          booker
          sys {
            publishedVersion
            id
          }
          status
          mixcloudLink
          artistsCollection(limit: 9) {
            items {
              sys {
                id
              }
              name
              email
            }
          }
          coverImage: coverImage {
            url
          }
          additionalImages
        }
      }
    }
  `;

  const res = await graphql(calendarQuery, {
    variables: { start, end, preview },
    preview,
  });

  const shows = extractCollection<CalendarShow>(res, "showCollection");

  const processed = shows.map((show) => {
    return {
      id: show.sys.id,
      title: show.title,
      type: show.type,
      artists: transformForDropdown(show.artistsCollection.items),
      start: show.date ? show.date.slice(0, -1) : null,
      end: show.dateEnd ? show.dateEnd.slice(0, -1) : null,
      status: show.status ? show.status : "Submitted",
      published: show.sys.publishedVersion ? true : false,
      backgroundColor:
        show.status == "TBC"
          ? "#EDB8B4"
          : show.status == "Confirmed"
          ? "#F1E2AF"
          : show.status == "Submitted"
          ? "#B3DCC1"
          : "#B3DCC1",
      borderColor:
        show.status == "TBC"
          ? "#EDB8B4"
          : show.status == "Confirmed"
          ? "#F1E2AF"
          : show.status == "Submitted"
          ? "#B3DCC1"
          : "#B3DCC1",
      booker: show.booker ? show.booker : "",
      mixcloudLink: show.mixcloudLink,
      images: [
        show.coverImage?.url,
        ...(show.additionalImages ? show.additionalImages : []),
      ],
    };
  });

  return {
    processed,
  };
}

export async function searchCalendarShows(query, preview: boolean) {
  const calendarQuery = /* GraphQL */ `
    query calendarQuery($query: String, $preview: Boolean) {
      showCollection(
        order: date_DESC
        where: { title_contains: $query }
        preview: $preview
        limit: 100
      ) {
        items {
          title
          type
          date
          dateEnd
          slug
          booker
          sys {
            publishedVersion
            id
          }
          status
          artistsCollection(limit: 9) {
            items {
              sys {
                id
              }
              name
              email
            }
          }
          coverImage {
            url
          }
          additionalImages
        }
      }
    }
  `;

  const res = await graphql(calendarQuery, {
    variables: { query, preview },
    preview,
  });

  const shows = extractCollection<CalendarShow>(res, "showCollection");

  const processed = shows.map((show) => {
    return {
      id: show.sys.id,
      title: show.title,
      start: show.date ? show.date.split(".000Z")[0] : null,
      end: show.dateEnd ? show.dateEnd.split(".000Z")[0] : null,
      mixcloudLink: show.mixcloudLink,
      status: show.status ? show.status : "Submitted",
      published: show.sys.publishedVersion ? true : false,
      artists: transformForDropdown(show.artistsCollection.items),
      booker: show.booker ? show.booker : "",
      images: [
        show.coverImage?.url,
        ...(show.additionalImages ? show.additionalImages : []),
      ],
    };
  });

  return {
    processed,
  };
}

// Add back in for calendar v2

export async function getArtists(limit: number, skip: number) {
  const AllArtistsQuery = /* GraphQL */ `
    query AllArtistsQuery($limit: Int, $skip: Int) {
      artistCollection(order: name_ASC, limit: $limit, skip: $skip) {
        items {
          sys {
            id
          }
          name
          email
        }
      }
    }
  `;

  const data = await graphql(AllArtistsQuery, {
    variables: { limit, skip },
  });

  return extractCollection<CalendarDropdownArtistEntry>(
    data,
    "artistCollection"
  );
}

export async function getAllArtists() {
  const artists = await getArtists(1000, 0);
  const artistsTwo = await getArtists(1000, 1000);
  const artistsThree = await getArtists(1000, 2000);

  const allArtists = artists.concat(artistsTwo.concat(artistsThree));

  const mappedArtists = allArtists.map((artists) => ({
    value: artists.sys.id,
    label: artists.name,
    email: artists.email,
  }));

  return mappedArtists;
}

export async function createCalendarShow(values) {
  const artists = createReferencesArray(values.artists);
  const startDateTime = dayjs(values.start + "Z").toISOString();
  const endDateTime = dayjs(values.end + "Z").toISOString();
  return client
    .getSpace(spaceId)
    .then((space) => space.getEnvironment(environmentId))
    .then((environment) =>
      environment.createEntry(showContentTypeId, {
        fields: {
          title: {
            "en-US": values.title,
          },
          internal: {
            "en-US": values.title,
          },
          date: {
            "en-US": startDateTime,
          },
          dateEnd: {
            "en-US": endDateTime,
          },
          artists: {
            "en-US": artists,
          },
          status: {
            "en-US": values.status.value,
          },
          booker: {
            "en-US": values.booker,
          },
          type: {
            "en-US": values.type,
          },
        },
      })
    )
    .then((entry) => {
      console.log(`Show ${entry.sys.id} created.`);
      return entry;
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

export async function updateCalendarShow(values) {
  const startDateTime = dayjs(values.start + "Z").toISOString();
  const endDateTime = dayjs(values.end + "Z").toISOString();
  let artists;
  if (values.artists) {
    artists = createReferencesArray(values.artists);
  }
  console.log(values);
  //fetch entry using id
  return (
    client
      .getSpace(spaceId)
      .then((space) => space.getEnvironment(environmentId))
      .then((environment) => environment.getEntry(values.id))
      //update fields with values from form
      .then((entry) => {
        console.log(entry);
        entry.fields.date["en-US"] = startDateTime;
        entry.fields.dateEnd["en-US"] = endDateTime;
        if (values.title) {
          entry.fields.title["en-US"] = values.title;
        }
        if (values.artists && values.artists.length) {
          entry.fields.artists["en-US"] = artists;
        }
        if (values.status && entry.fields.status) {
          entry.fields.status["en-US"] = values.status.value;
        }
        if (values.booker & entry.fields.booker) {
          entry.fields.booker["en-US"] = values.booker;
        }
        if (entry.fields.type) {
          entry.fields.type["en-US"] = values.type;
        }
        return entry.update();
      })
      .then((entry) => {
        // if entry has already been published we want to publish updates
        console.log("is entry published: " + isPublished(entry));
        if (isPublished(entry)) {
          return entry.publish();
        }
        return entry;
      })
      .then((entry) => {
        console.log(`Show ${entry.sys.id} updated.`);
        return entry;
      })
      .catch((error) => {
        console.log(error);
        throw error;
      })
  );
}

export async function deleteCalendarShow(id) {
  return client
    .getSpace(spaceId)
    .then((space) => space.getEnvironment(environmentId))
    .then((environment) => environment.getEntry(id))
    .then((entry) => entry.archive())
    .then((entry) => {
      console.log(`Show ${entry.sys.id} deleted.`);
      return entry;
      // res.status(202).json({});
    })
    .catch((error) => {
      console.log(error);
      throw error;
      // res.status(400).json({ message: error.message });
    });
}

export async function createArtist(artist) {
  return client
    .getSpace(spaceId)
    .then((space) => space.getEnvironment(environmentId))
    .then((environment) =>
      environment.createEntry(artistContentTypeId, {
        fields: {
          internal: {
            "en-US": artist.name,
          },
          name: {
            "en-US": artist.name,
          },
          pronouns: {
            "en-US": artist.pronouns,
          },
          role: {
            "en-US": false,
          },
          email: {
            "en-US": false,
          },
        },
      })
    )
    .then((entry) => {
      console.log(`Artist ${entry.sys.id} created.`);
      const addedArtist = {
        value: entry.sys.id,
        label: artist.name,
      };
      return addedArtist;
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

export async function updateArtistEmail(id, email) {
  console.log(id);
  return (
    client
      .getSpace(spaceId)
      .then((space) => space.getEnvironment(environmentId))
      .then((environment) => environment.getEntry(id))
      //update fields with values from form
      .then((entry) => {
        console.log(entry);
        entry.fields.email = {
          "en-US": [email],
        };
        return entry.update();
      })
      .then((entry) => entry.publish())
      .then((entry) => {
        console.log(`Artist ${entry.sys.id} updated.`);
        return entry;
      })
      .catch((error) => {
        console.log(error);
        throw error;
      })
  );
}

function isPublished(entity) {
  return entity.sys.publishedVersion;
}
