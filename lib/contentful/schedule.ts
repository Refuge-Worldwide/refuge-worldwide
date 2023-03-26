import dayjs from "dayjs";
import next from "next";
import { graphql } from ".";
import { ScheduleShow } from "../../types/shared";
import { extractCollection } from "../../util";

export async function getScheduleData() {
  const start = Date.now();
  const now = dayjs();
  const startOfDay = now.startOf("day");
  const startSchedule = startOfDay.toISOString();
  const endSchedule = startOfDay.add(2, "day").toISOString();

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

  let liveNow: ScheduleShow;
  let nextUp: Array<ScheduleShow>;

  schedule.forEach((show, index) => {
    show.title = show.title.replace("| Residency", "");
    show.title = show.title.replace("|", "with");
    if (!nextUp && now.isBefore(dayjs(show.dateEnd))) {
      if (now.isAfter(dayjs(show.date))) {
        liveNow = show;
        nextUp = schedule.slice(index + 1, index + 5);
      } else {
        nextUp = schedule.slice(index, index + 4);
      }
    }
  });

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
