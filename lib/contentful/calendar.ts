import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import next from "next";
import { graphql } from ".";
import { ScheduleShow } from "../../types/shared";
import { extractCollection } from "../../util";
dayjs.extend(utc);

export async function getCalendarShows(start, end) {
  const calendarQuery = /* GraphQL */ `
    query calendarQuery($start: DateTime, $end: DateTime) {
      showCollection(
        order: date_ASC
        where: { date_gte: $start, dateEnd_lte: $end, dateEnd_exists: true }
        preview: false
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
    variables: { start, end },
  });

  console.log(res);

  const shows = extractCollection<ScheduleShow>(res, "showCollection");

  // const end = Date.now();

  const processed = shows.map((event) => {
    return {
      title: event.title,
      start: event.date,
      end: event.dateEnd,
    };
  });

  return {
    processed,
  };
}
