import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import useSchedule from "../../hooks/useSchedule";
import { ScheduleShow } from "../../types/shared";
import LocalTime from "../../components/localTime";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Pill from "../../components/pill";

dayjs.extend(utc);

export default function SchedulePage() {
  return (
    <Layout>
      <PageMeta title="Schedule | Refuge Worldwide" path="radio/schedule" />
      <section>
        <h1>Schedule</h1>
        <Schedule />
      </section>
    </Layout>
  );
}

function Schedule() {
  const { scheduleData, isLoading, error } = useSchedule();
  console.log(scheduleData);
  if (isLoading) return <div>loading...</div>;
  if (error) return <div>Fail to Load Data</div>;
  return (
    <ScheduleByDay
      schedule={scheduleData.schedule}
      liveNow={scheduleData.liveNow}
    />
  );
}

function ScheduleByDay({
  liveNow,
  schedule,
}: {
  liveNow?: ScheduleShow;
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
    <section>
      {Object.keys(scheduleByDate).map((day) => (
        <div key={day} className="mb-6">
          <Pill>
            <h2>{day}</h2>
          </Pill>
          {scheduleByDate[day].map((show, index) => (
            <div key={show.title} className="flex gap-3">
              <div className="min-w-[60px]">
                <LocalTime dateTime={show.date} />
              </div>
              <p>{show.title}</p>
              {show.title == liveNow?.title && (
                <div className="h-4 w-4 bg-red animate-pulse rounded-full" />
              )}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
