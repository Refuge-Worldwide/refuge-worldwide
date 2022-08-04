import Pill from "../../components/pill";
import UpcomingShowPreview from "../../components/upcomingShowPreview";
import { UpcomingShowType } from "../../lib/contentful/pages/radio";

export default function NextShows({
  upcomingShows,
}: {
  upcomingShows: UpcomingShowType[];
}) {
  return (
    <section className="bg-orange border-2">
      <div className="p-4 sm:p-8">
        <Pill>
          <h2>Coming Soon</h2>
        </Pill>

        <div className="h-5 sm:h-8" />

        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {upcomingShows.map((show, i) => (
            <li key={i}>
              <UpcomingShowPreview {...show} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
