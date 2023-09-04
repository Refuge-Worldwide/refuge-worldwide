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

  const processed = shows.map((show) => {
    return {
      id: show.sys.id,
      title: show.title,
      artists: show.artistsCollection.items.map((artists) => ({
        value: artists.sys.id,
        label: artists.name,
      })),
      start: show.date.slice(0, -1),
      end: show.dateEnd.slice(0, -1),
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
      booker: show.booker ? show.booker : "George",
      mixcloudLink: show.mixcloudLink,
    };
  });

  return {
    processed,
  };
}
