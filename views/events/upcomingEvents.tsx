import { EventInterface } from "../../types/shared";
import Pill from "../../components/pill";
import EventRow from "../../components/eventRow";

export default function UpcomingEvents({ events, filter }) {
  return (
    <div className="border-t-2 bg-blue">
      {Object.keys(events).map((month, index) => (
        <div key={month}>
          <div
            className={`p-4 sm:p-8 sticky top-12 lg:top-14 border-b bg-blue ${
              index > 0 ? "border-t" : ""
            }`}
          >
            <Pill outline>
              <h3>{month}</h3>
            </Pill>
          </div>
          <ul>
            {events[month].map((event) => (
              <EventRow filter={filter} key={event.title} event={event} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
