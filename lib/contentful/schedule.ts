import dayjs from "dayjs";
import { graphql } from ".";
import { ScheduleShow } from "../../types/shared";
import { extractCollection } from "../../util";

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
          dateEnd_gt: $startSchedule
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

  const schedule = extractCollection<ScheduleShow>(res, "showCollection");

  schedule.forEach((show) => {
    show.title = show.title.replace("| Residency", "");
    show.title = show.title.replace("|", "with");
  });

  let liveNow;
  let nextUp;

  if (dayjs(schedule[0].date).isBefore(startDate)) {
    liveNow = schedule[0];
    nextUp = schedule.slice(1, 5);
  } else {
    nextUp = schedule.slice(0, 4);
  }

  const end = Date.now();

  return {
    data: {
      liveNow: liveNow,
      nextUp: nextUp,
      schedule: schedule,
    },
    duration: end - start,
  };
}
