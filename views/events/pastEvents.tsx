import { EventInterface } from "../../types/shared";
import Pill from "../../components/pill";
import EventRow from "../../components/eventRow";

export default function PastEvents({ events }) {
  return (
    <section className="bg-blue pt-24 lg:pt-32">
      <div className="p-4 sm:p-8 border-b-2 sticky top-12 lg:top-14 bg-blue">
        <Pill outline>
          <h2>Past events</h2>
        </Pill>
      </div>

      <ul>
        {events.map((event) => (
          <EventRow past={true} key={event.title} event={event} />
        ))}
      </ul>
    </section>
  );
}
