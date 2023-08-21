import Pill from "../../components/pill";
import Image from "next/image";
import { EventInterface } from "../../types/shared";
import loaders from "../../lib/loaders";
import Date from "../../components/date";
import { EventBadge } from "../../components/badge";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/core";
import { EventLink } from "../../components/eventRow";

export default function FeaturedEvents({
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
            height: "100%",
            width: "100%",
            gap: "2rem",
            focus: 0,
            autoWidth: true,
            autoHeight: true,
            lazyLoad: "nearby",
            drag: true,
            arrows: false,
            pagination: true,
          }}
        >
          {events.map((event, i) => (
            <SplideSlide
              className={`w-[calc(100vw-2rem)] max-w-[400px] ${
                events.length < 4 ? "xl:max-w-[calc((100vw/3)-3.1rem)]" : null
              }`}
              key={i}
            >
              <EventLink event={event}>
                <div className="flex flex-col md:w-auto md:h-auto">
                  <Image
                    key={event.coverImage.sys.id}
                    src={event.coverImage.url}
                    loader={loaders.contentful}
                    width={600}
                    height={600}
                    alt={event.title}
                    className="bg-black/10 object-cover object-center aspect-square w-full h-auto"
                  />
                </div>

                <div className="h-4" />

                <div className="flex">
                  <EventBadge
                    eventType={event.eventType}
                    cross
                    text={event.eventType}
                  />
                </div>

                <div className="h-2" />

                <h2
                  id={`upcoming-${event.slug}`}
                  className="text-base sm:text-base"
                >
                  {event.title}
                </h2>

                <div className="h-2" />

                <p className="text-small">
                  {" "}
                  <Date dateString={event.date} />
                </p>
              </EventLink>
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </section>
  );
}
