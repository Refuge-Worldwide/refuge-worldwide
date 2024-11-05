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
        preview: true
      ) {
        items {
          title
          date
          dateEnd
          slug
          channel
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
    preview: true,
  });

  const schedule = extractCollection<ScheduleShow>(res, "showCollection");

  console.log(schedule);

  let liveNowCh1: ScheduleShow;
  let liveNowCh2: ScheduleShow;
  let nextUpCh1: Array<ScheduleShow>;
  let ch1Schedule: Array<ScheduleShow> = [];
  let ch2Schedule: Array<ScheduleShow> = [];

  schedule.forEach((show, index) => {
    show.date = dayjs(show.date)
      .subtract(cetAdjustment, "minutes")
      .toISOString();
    show.dateEnd = dayjs(show.dateEnd)
      .subtract(cetAdjustment, "minutes")
      .toISOString();
    show.title = show.title.replace("|", "—");

    if (show.channel === "2") {
      ch2Schedule.push(show);
    } else {
      ch1Schedule.push(show);
    }

    if (nowUTC.isBefore(dayjs(show.dateEnd))) {
      if (nowUTC.isAfter(dayjs(show.date))) {
        if (show.channel !== "2" && !liveNowCh1) {
          liveNowCh1 = show;
          nextUpCh1 = schedule
            .slice(index + 1, index + 5)
            .filter((s) => s.channel !== "2");
          show.live = true;
        } else if (show.channel === "2" && !liveNowCh2) {
          liveNowCh2 = show;
          show.live = true;
        }
      } else {
        if (show.channel !== "2" && nextUpCh1.length === 0) {
          nextUpCh1 = schedule
            .slice(index, index + 4)
            .filter((s) => s.channel !== "2");
        }
      }
    }
  });

  const end = Date.now();

  return {
    data: {
      ch1: {
        liveNow: liveNowCh1 || null,
        nextUp: nextUpCh1,
        schedule: ch1Schedule,
      },
      ch2: {
        liveNow: liveNowCh2 || null,
        nextUp: [],
        schedule: ch2Schedule,
      },
    },
    duration: end - start,
  };
}
