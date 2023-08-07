import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import next from "next";
import { graphql } from ".";
import { ScheduleShow } from "../../types/shared";
import { extractCollection } from "../../util";
dayjs.extend(utc);

export async function getCalendarShows(preview: boolean, start, end) {
  const calendarQuery = /* GraphQL */ `
    query calendarQuery($preview: Boolean, $start: DateTime, $end: DateTime) {
      showCollection(
        order: date_ASC
        where: { date_gte: $start, dateEnd_lte: $end, dateEnd_exists: true }
        preview: $preview
      ) {
        items {
          title
          date
          dateEnd
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
        }
      }
    }
  `;

  const res = await graphql(calendarQuery, {
    variables: { preview, start, end },
  });

  const shows = extractCollection<ScheduleShow>(res, "showCollection");

  console.log(shows[0]);

  // const end = Date.now();

  const processed = shows.map((event) => {
    return {
      title: event.title,
      artists: event.artistsCollection.items,
      start: event.date.slice(0, -1),
      end: event.dateEnd.slice(0, -1),
    };
  });

  return {
    processed,
  };
}
