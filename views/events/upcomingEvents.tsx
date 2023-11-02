import { EventInterface } from "../../types/shared";
import Pill from "../../components/pill";
import EventRow from "../../components/eventRow";

export default function UpcomingEvents({ events }) {
  return (
    <div className="">
      {Object.keys(events)
        .reverse()
        .map((month, index) => (
          <div key={month}>
            <div
              className={`p-4 sm:p-8 sticky top-12 lg:top-14 border-b bg-white ${
                index > 0 ? "border-t" : ""
              }`}
            >
              <div className="max-w-screen-xl mx-auto">
                <Pill outline>
                  <h3>{month}</h3>
                </Pill>
              </div>
            </div>
            <ul>
              {events[month].map((event) => (
                <EventRow key={event.slug} event={event} />
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
