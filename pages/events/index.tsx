import UpcomingEvents from "../../views/events/upcomingEvents";
import PastEvents from "../../views/events/pastEvents";
import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import Pill from "../../components/pill";
import PageMeta from "../../components/seo/page";
import { getEventsPage } from "../../lib/contentful/pages/events";
import dayjs from "dayjs";
import { EventBadge } from "../../components/badge";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import FeaturedEvents from "../../views/events/featuredEvents";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import { Chevron } from "../../icons/chevron";

export async function getStaticProps({ preview = false }) {
  return {
    props: { preview, ...(await getEventsPage(preview)) },
  };
}

export default function NewsPage({
  featuredEvents,
  events,
  preview,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const now = dayjs();
  const [filter, setFilter] = useState<string>("");
  const [title, setTitle] = useState<string>("events");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);

  const eventTypes = [
    {
      label: "Workshops",
      value: "Workshop",
    },
    {
      label: "Parties",
      value: "Party",
    },
    {
      label: "Fundraisers",
      value: "Fundraiser",
    },
    {
      label: "Hang outs",
      value: "Hang out",
    },
    {
      label: "Exhibitions",
      value: "Exhibition",
    },
  ];

  const updateFilter = (value: string, label) => () => {
    if (value == filter) {
      // router.push(`/events`, undefined, {
      //   shallow: true,
      // });
      setFilter("");
      setTitle("events");
      sortEvents(events);
    } else {
      // router.push(`/events?type=${encodeURIComponent(value)}`, undefined, {
      //   shallow: true,
      // });
      setFilter(value);
      setTitle(label.toLowerCase());
      sortEvents(filterEvents(value));
    }
  };

  const filterEvents = (filter) => {
    const filteredEvents = events.filter((event) => event.eventType == filter);
    return filteredEvents;
  };

  const sortEvents = (e) => {
    let uEvents = [];
    let pEvents = [];
    let reachedPastEvents = false;
    e.forEach((event) => {
      let eventEndDate;
      if (event.endDate) {
        eventEndDate = event.endDate;
      } else {
        eventEndDate = event.date;
      }
      if (!reachedPastEvents && dayjs(eventEndDate).isAfter(now)) {
        const month = dayjs(event.date).format("MMMM");
        console.log(event);
        if (uEvents[month]) {
          uEvents[month].unshift(event);
        } else {
          uEvents[month] = [event];
        }
      } else {
        reachedPastEvents = true;
        pEvents.push(event);
      }
    });
    setUpcomingEvents(uEvents);
    setPastEvents(pEvents);
  };

  useEffect(() => {
    sortEvents(events);
  }, []);

  return (
    <Layout preview={preview}>
      <PageMeta title="Events | Refuge Worldwide" path="events/" />
      {/* <GameOfLife /> */}
      <FeaturedEvents events={featuredEvents} />
      <section className="p-4 sm:p-8 border-b-2">
        <div className="max-w-[1229px] mx-auto">
          <div className="lg:flex justify-between ">
            <h1 className="hidden">Events</h1>
            <Pill outline>
              <h2>Upcoming {title}</h2>
            </Pill>
            <div className="h-5 lg:hidden" />
            <div className="py-2 px-4 border-2 border-black rounded-full w-fit flex flex-nowrap items-center max-w-full overflow-hidden">
              <span className="text-tiny py-3 px-2 font-medium w-max">
                FILTER
              </span>
              <Splide
                options={{
                  pagination: false,
                  autoWidth: true,
                  autoHeight: true,
                  gap: "0.5rem",
                }}
                hasTrack={false}
                className="w-full pl-2 pr-16 md:pr-0 md:-mr-2 relative"
                aria-label="Filter events by type"
              >
                <SplideTrack className="">
                  {eventTypes.map((type) => (
                    <SplideSlide className="flex items-center" key={type.value}>
                      <button
                        key={type.value}
                        onClick={updateFilter(type.value, type.label)}
                        className="focus:outline-none focus:ring-4 rounded-full"
                      >
                        <EventBadge
                          eventType={type.value}
                          cross
                          filter
                          invert={filter == type.value}
                          text={type.label}
                        />
                      </button>
                    </SplideSlide>
                  ))}
                </SplideTrack>
                <div className="splide__arrows md:hidden">
                  <button className="splide__arrow splide__arrow--prev disabled:hidden absolute -left-2 -top-0.5 h-[calc(100%+3px)] bg-gradient-to-r from-white via-white via-30% pl-2 pr-6">
                    <Chevron className="rotate-90" />
                  </button>
                  <button className="splide__arrow splide__arrow--next disabled:hidden absolute right-12 -top-0.5 h-[calc(100%+3px)] bg-gradient-to-l from-white via-white via-30% pl-6 pr-2">
                    <Chevron className="-rotate-90" />
                  </button>
                </div>
              </Splide>
            </div>
          </div>
        </div>
      </section>

      <div className="">
        <div className="max-w-screen-xl mx-auto">
          {/* <pre>{JSON.stringify(upcomingEvents, null, 2)}</pre> */}
          {/* <pre>{JSON.stringify(pastEvents, null, 2)}</pre> */}
          {Object.keys(upcomingEvents).length > 0 ? (
            <UpcomingEvents events={upcomingEvents} />
          ) : (
            <div className="">
              <div className="max-w-screen-xl mx-auto">
                <p className="p-4 sm:p-8 text-smedium font-medium md:font-light md:text-small">
                  No upcoming {title}, please check back soon.
                </p>
              </div>
            </div>
          )}
          {pastEvents.length > 0 && (
            <PastEvents title={title} events={pastEvents} />
          )}
        </div>
      </div>
    </Layout>
  );
}
