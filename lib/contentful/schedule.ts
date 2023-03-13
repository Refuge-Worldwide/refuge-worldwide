import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";
import { graphql } from ".";
import { ScheduleShowInterface } from "../../types/shared";
import { extractCollection } from "../../util";
// dayjs.extend(utc);

export async function getScheduleData() {
  const start = Date.now();
  const startDate = dayjs();
  const startOfDay = startDate.format();
  const endOfDay = startDate.add(1, "day").format();

  const scheduleQuery = /* GraphQL */ `
    query scheduleQuery($start: DateTime, $end: DateTime) {
      showCollection(
        order: date_ASC
        where: { date_gt: $start, dateEnd_lt: $end }
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

  const res = await graphql(scheduleQuery, {
    variables: { startOfDay, endOfDay },
  });

  const schedule = extractCollection<ScheduleShowInterface>(
    res,
    "showCollection"
  );

  const end = Date.now();

  return {
    data: schedule,
    duration: end - start,
  };
}
