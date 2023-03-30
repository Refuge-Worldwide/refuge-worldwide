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
    <Layout className="bg-orange">
      <PageMeta title="Schedule | Refuge Worldwide" path="radio/schedule" />
      <section className="max-w-[700px] mx-auto py-16">
        <h1 className="text-center mb-16 text-large">Schedule</h1>
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
    <div className="min-h-[60vh]">
      {Object.keys(scheduleByDate).map((day, index) => (
        <div
          key={day}
          className={`${
            index > 0 ? "border-t-2 border-black pt-16" : ""
          } mb-16`}
        >
          <Pill outline>
            <h2>{day}</h2>
          </Pill>
          <div className="h-5 sm:h-8" />
          {scheduleByDate[day].map((show) => (
            <div
              key={show.title}
              className={`
                ${
                  show.title == liveNow
                    ? "bg-black border-white text-white py-3"
                    : ""
                } flex gap-3 px-3 my-2
              `}
            >
              <div className="min-w-[60px] font-medium">
                <LocalTime dateTime={show.date} />
              </div>
              <p>{show.title}</p>
              {show.title == liveNow && (
                <div className="h-4 w-4 bg-red animate-pulse rounded-full self-center" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
