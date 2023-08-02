import Pill from "../../components/pill";
import Image from "next/image";
import { EventInterface } from "../../types/shared";
import loaders from "../../lib/loaders";
import Date from "../../components/date";

export default function FeaturedEventsSBS({
  events,
}: {
  events: EventInterface[];
}) {
  return (
    <section className="bg-blue border-2">
      <div className="p-4 sm:p-8">
        <Pill>
          <h2>Featured Events</h2>
        </Pill>

        <div className="h-5 sm:h-8" />

        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {events.map((event, i) => (
            <li key={i}>
              <article>
                <div className="flex w-full">
                  <Image
                    key={event.coverImage.sys.id}
                    src={event.coverImage.url}
                    loader={loaders.contentful}
                    width={590}
                    height={335}
                    alt={event.title}
                    className="bg-black/10 object-cover object-center aspect-[1/1.414]"
                  />
                </div>

                <div className="h-4" />

                <div className="flex">
                  <Pill size="small">
                    <span className="font-serif text-tiny sm:text-small">
                      {event.eventType}
                    </span>
                  </Pill>
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
