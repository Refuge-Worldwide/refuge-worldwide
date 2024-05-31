import Pill from "../../components/pill";
import UpcomingShowPreview from "../../components/upcomingShowPreview";
import { UpcomingShowType } from "../../lib/contentful/pages/radio";
import dayjs from "dayjs";

export default function NextShows({
  upcomingShows,
}: {
  upcomingShows: UpcomingShowType[];
}) {
  const today = dayjs();

  const filteredUpcomingShows = upcomingShows
    .filter((show) => {
      if (today.isBefore(show.date, "day")) return true;
    })
    .slice(0, 4);
  return (
    <section className="bg-orange border-2">
      <div className="p-4 sm:p-8">
        <Pill>
          <h2>Coming Soon</h2>
        </Pill>

        <div className="h-5 sm:h-8" />

        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {filteredUpcomingShows.map((show, i) => (
            <li key={i}>
              <UpcomingShowPreview {...show} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
