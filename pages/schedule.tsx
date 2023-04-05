import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import useSchedule from "../hooks/useSchedule";
import { ScheduleShow } from "../types/shared";
import LocalTime from "../components/localTime";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Pill from "../components/pill";
import Link from "next/link";
import Loading from "../components/loading";
dayjs.extend(utc);

export default function SchedulePage() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <Layout className="bg-orange">
      <PageMeta title="Schedule | Refuge Worldwide" path="radio/schedule" />
      <section className="p-4 sm:p-8">
        <Pill outline>
          <h1>Schedule</h1>
        </Pill>
        <p className="mt-4 md:mt-8 text-small">
          Displayed in your timezone: {timezone}
        </p>
      </section>
      <Schedule />
    </Layout>
  );
}

function Schedule() {
  const { scheduleData, isLoading, error } = useSchedule();
  console.log(scheduleData);
  if (isLoading) return <Loading />;
  if (error) return <div>Fail to Load Schedule</div>;
  return (
    <ScheduleByDay
      schedule={scheduleData.schedule}
      liveNow={scheduleData.liveNow.title}
    />
  );
}

function ScheduleByDay({
  liveNow,
  schedule,
}: {
  liveNow?: String;
  schedule: Array<ScheduleShow>;
}) {
  const scheduleByDate: any = {};

  schedule.forEach((show) => {
    const utc = dayjs(show.date).utc();
    const local = utc.local();
    const day = local.format("ddd DD MMM");
    if (scheduleByDate[day]) {
      scheduleByDate[day].push(show);
    } else {
      scheduleByDate[day] = [show];
    }
  });

  return (
    <div className="min-h-[60vh] xl:grid-cols-2 xl:grid">
      {Object.keys(scheduleByDate).map((day, index) => (
        <section
          key={day}
          className={`p-4 xl:py-12  sm:p-8 border-t-2 border-black ${
            index % 2 == 0 ? "xl:border-r-2" : ""
          }`}
        >
          <div className="max-w-[700px]">
            <Pill outline size="medium">
              <h2>{day}</h2>
            </Pill>
            <div className="h-5 sm:h-8" />
            {scheduleByDate[day].map((show) => (
              <div
                key={show.title}
                className={`
                ${
                  show.live ? "bg-black text-white py-3" : ""
                } flex gap-3 px-3 my-2
              `}
              >
                <div className="min-w-[50px] sm:min-w-[80px]">
                  <LocalTime dateTime={show.date} />
                </div>
                <Link href={`/radio/${show.slug}`}>{show.title}</Link>
                {show.live && (
                  <div className="flex-none	h-4 w-4 bg-red animate-pulse rounded-full self-center" />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
