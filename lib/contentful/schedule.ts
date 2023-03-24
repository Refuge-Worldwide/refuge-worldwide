import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { graphql } from ".";
import { ScheduleShowInterface } from "../../types/shared";
import { extractCollection } from "../../util";
dayjs.extend(utc);

export async function getScheduleData() {
  const start = Date.now();
  const startDate = dayjs();
  const startSchedule = startDate.toISOString();
  const endSchedule = startDate.add(2, "day").toISOString();

  console.log(startSchedule);
  console.log(endSchedule);

  const scheduleQuery = /* GraphQL */ `
    query scheduleQuery($startSchedule: DateTime, $endSchedule: DateTime) {
      showCollection(
        order: date_ASC
        where: {
          date_gte: $startSchedule
          dateEnd_lte: $endSchedule
          dateEnd_exists: true
        }
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
    variables: { startSchedule, endSchedule },
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
