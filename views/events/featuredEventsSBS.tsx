import Pill from "../../components/pill";
import Image from "next/image";
import { EventInterface } from "../../types/shared";
import loaders from "../../lib/loaders";
import Date from "../../components/date";
import { EventBadge } from "../../components/badge";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/core";

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
        <Splide
          aria-label="Featured events"
          options={{
            type: "slide",
            // height: 600,
            width: "100%",
            gap: "2rem",
            focus: 0,
            autoWidth: true,
            autoHeight: true,
            lazyLoad: "nearby",
            drag: "free",
            arrows: false,
          }}
        >
          {events.map((event, i) => (
            <SplideSlide key={i}>
              <article className="flex flex-col">
                <div>
                  <Image
                    key={event.coverImage.sys.id}
                    src={event.coverImage.url}
                    loader={loaders.contentful}
                    width={400}
                    height={400}
                    alt={event.title}
                    className="bg-black/10 object-cover object-center aspect-square h-full h-full"
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
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </section>
  );
}
