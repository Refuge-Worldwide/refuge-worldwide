import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import next from "next";
import { graphql } from ".";
import { ScheduleShow } from "../../types/shared";
import { extractCollection } from "../../util";
dayjs.extend(utc);
dayjs.extend(timezone);

export async function getScheduleData() {
  const cetAdjustment = dayjs().tz("Europe/Berlin").utcOffset();
  let endScheduleAdjustment = 2;
  const start = Date.now();
  const nowUTC = dayjs.utc();
  const nowCET = nowUTC.add(cetAdjustment, "minutes");
  const startOfDay = nowCET.subtract(5, "hour").startOf("day").add(5, "hours");
  const startSchedule = startOfDay.toISOString();
  const dayOfWeek = startOfDay.day();
  // if (dayOfWeek == 6 || dayOfWeek == 0) {
  //   endScheduleAdjustment = 3;
  // }
  const endSchedule = startOfDay
    .add(endScheduleAdjustment, "day")
    .toISOString();

  const scheduleQuery = /* GraphQL */ `
    query scheduleQuery($startSchedule: DateTime, $endSchedule: DateTime) {
      showCollection(
        order: date_ASC
        where: {
          date_gt: $startSchedule
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
    show.date = dayjs(show.date)
      .subtract(cetAdjustment, "minutes")
      .toISOString();
    show.dateEnd = dayjs(show.dateEnd)
      .subtract(cetAdjustment, "minutes")
      .toISOString();
    show.title = show.title.replace("|", "—");
    if (!nextUp && nowUTC.isBefore(dayjs(show.dateEnd))) {
      if (nowUTC.isAfter(dayjs(show.date))) {
        liveNow = show;
        nextUp = schedule.slice(index + 1, index + 5);
        show.live = true;
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
