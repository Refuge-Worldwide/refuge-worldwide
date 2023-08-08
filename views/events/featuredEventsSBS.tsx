import Pill from "../../components/pill";
import Image from "next/image";
import { EventInterface } from "../../types/shared";
import loaders from "../../lib/loaders";
import Date from "../../components/date";
import { EventBadge } from "../../components/badge";

export default function FeaturedEventsSBS({
  events,
}: {
  events: EventInterface[];
}) {
  return (
    <section className="bg-blue border-t-2 border-b-2">
      <div className="p-4 sm:p-8">
        <Pill outline>
          <h2>Featured Events</h2>
        </Pill>

        <div className="h-5 sm:h-8" />

        <ul className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          {events.map((event, i) => (
            <li key={i}>
              <article>
                <div className="flex w-full">
                  <Image
                    key={event.coverImage.sys.id}
                    src={event.coverImage.url}
                    loader={loaders.contentful}
                    width={500}
                    height={500}
                    alt={event.title}
                    className="bg-black/10 object-cover object-center aspect-square"
                  />
                </div>

                <div className="h-4" />

                <div className="flex">
                  <EventBadge
                    eventType={event.eventType}
                    cross
                    filter
                    text={event.eventType}
                  />
                </div>

                <div className="h-2" />

                <h2
                  id={`upcoming-${event.slug}`}
                  className="text-base sm:text-large"
                >
                  {event.title}
                </h2>

                <div className="h-2" />

                <p>
                  {" "}
                  <Date dateString={event.date} />
                </p>

                <div className="h-3" />
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
