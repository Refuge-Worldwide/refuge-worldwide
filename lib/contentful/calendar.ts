import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import next from "next";
import { graphql } from ".";
import { extractCollection } from "../../util";
import { ArtistInterface } from "../../types/shared";
dayjs.extend(utc);

interface CalendarShow {
  sys: {
    id: string;
    publishedVersion: string;
  };
  status: string;
  title: string;
  localStartTime?: string;
  date: string;
  dateEnd: string;
  slug: string;
  booker: string;
  mixcloudLink: string;
  artistsCollection: {
    items: ArtistInterface[];
  };
  live?: boolean;
}

export async function getCalendarShows(preview: boolean, start, end) {
  const calendarQuery = /* GraphQL */ `
    query calendarQuery($preview: Boolean, $start: DateTime, $end: DateTime) {
      showCollection(
        order: date_ASC
        where: { date_gte: $start, dateEnd_lte: $end, dateEnd_exists: true }
        preview: $preview
        limit: 999
      ) {
        items {
          title
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
          coverImage {
            sys {
              id
            }
            url
          }
          artistsCollection(limit: 9) {
            items {
              name
              sys {
                id
              }
            }
          }
        }
      }
    }
  `;

  const res = await graphql(calendarQuery, {
    variables: { preview, start, end },
  });

  const shows = extractCollection<CalendarShow>(res, "showCollection");

  const processed = shows.map((event) => {
    return {
      title: event.title,
      artists: event.artistsCollection.items.map((artists) => ({
        value: artists.sys.id,
        label: artists.name,
      })),
      start: event.date.slice(0, -1),
      end: event.dateEnd.slice(0, -1),
      status: event.status ? event.status : "Submitted",
      published: event.sys.publishedVersion ? true : false,
      backgroundColor:
        event.status == "TBC"
          ? "#EDB8B4"
          : event.status == "Confirmed"
          ? "#F1E2AF"
          : event.status == "Submitted"
          ? "#B3DCC1"
          : "#B3DCC1",
      borderColor:
        event.status == "TBC"
          ? "#EDB8B4"
          : event.status == "Confirmed"
          ? "#F1E2AF"
          : event.status == "Submitted"
          ? "#B3DCC1"
          : "#B3DCC1",
      contentfulId: event.sys.id,
      booker: event.booker ? event.booker : "George",
      mixcloudLink: event.mixcloudLink,
    };
  });

  return {
    processed,
  };
}
