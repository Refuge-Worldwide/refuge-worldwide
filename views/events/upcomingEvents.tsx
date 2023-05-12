// import ArticlePreview from "../../components/articlePreview";
// import useNewsArticles from "../../hooks/useNewsArticles";
import { EventInterface } from "../../types/shared";
import Pill from "../../components/pill";
import EventRow from "../../components/eventRow";
// import Image from "next/image";

export default function UpcomingEvents({ upcomingEvents }) {
  return (
    <section className="bg-blue">
      <div className="p-4 sm:p-8">
        <Pill outline>
          <h2>Upcoming events</h2>
        </Pill>
      </div>

      <div className="border-t-2">
        {upcomingEvents.map((month, index) => (
          <div key={month.month}>
            <div className={`p-4 sm:p-8 ${index > 0 ? "border-t" : ""}`}>
              <Pill outline>
                <h3>{month.month}</h3>
              </Pill>
            </div>
            <ul>
              {month.events.map((event) => (
                <EventRow key={event.title} event={event} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
