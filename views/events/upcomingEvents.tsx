// import ArticlePreview from "../../components/articlePreview";
// import useNewsArticles from "../../hooks/useNewsArticles";
import { EventInterface } from "../../types/shared";
import Pill from "../../components/pill";
import EventRow from "../../components/eventRow";
// import Image from "next/image";

export default function UpcomingEvents({
  upcomingEvents,
}: {
  upcomingEvents: EventInterface[];
}) {
  return (
    <section className="bg-blue">
      <Pill outline>Upcoming events</Pill>
      <ul>
        {upcomingEvents.map((event) => (
          <EventRow key={event.title} event={event} />
        ))}
      </ul>
    </section>
  );
}
