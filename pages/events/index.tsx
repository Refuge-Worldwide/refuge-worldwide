import UpcomingEvents from "../../views/events/upcomingEvents";
import PastEvents from "../../views/events/pastEvents";
import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import Pill from "../../components/pill";
import PageMeta from "../../components/seo/page";
import { getEventsPage } from "../../lib/contentful/pages/events";
import dayjs from "dayjs";
import { EventBadge } from "../../components/badge";
import { useState } from "react";
import { useRouter } from "next/router";

export async function getStaticProps({ preview = false }) {
  return {
    props: { preview, ...(await getEventsPage(preview)) },
  };
}

export default function NewsPage({
  events,
  preview,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const now = dayjs();
  let reachedPastEvents = false;
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
      router.push(`/events`, undefined, {
        shallow: true,
      });
      setFilter("");
      setTitle("events");
      sortEvents(events);
    } else {
      router.push(`/events?type=${encodeURIComponent(value)}`, undefined, {
        shallow: true,
      });
      setFilter(value);
      setTitle(label.toLowerCase());
      sortEvents(filterEvents(value));
    }
  };

  const filterEvents = (filter) => {
    const filteredEvents = events.filter((event) => event.eventType == filter);
    return filteredEvents;
  };

  const sortEvents = (events) => {
    let upcomingEvents = [];
    let pastEvents = [];
    events.forEach((event) => {
      if (!reachedPastEvents && dayjs(event.date).isAfter(now)) {
        const month = dayjs(event.date).format("MMMM");
        console.log(event);
        if (upcomingEvents[month]) {
          upcomingEvents[month].unshift(event);
        } else {
          upcomingEvents[month] = [event];
        }
      } else {
        reachedPastEvents = true;
        pastEvents.push(event);
      }
    });
    setUpcomingEvents(upcomingEvents);
    setPastEvents(pastEvents);
  };

  // sortEvents(events);

  return (
    <Layout preview={preview}>
      <PageMeta title="Events | Refuge Worldwide" path="events/" />

      <section className="p-4 sm:p-8 md:flex justify-between bg-blue">
        <h1 className="hidden">Events</h1>
        <Pill outline>
          <h2>Upcoming {title}</h2>
        </Pill>
        <div className="h-5 md:hidden" />
        <div className="py-2 px-4 border-2 border-black rounded-full w-fit flex space-x-2 grow-1 relative">
          <span className="text-tiny py-3 px-2 font-medium w-max">FILTER</span>
          {eventTypes.map((type) => (
            <button
              key={type.value}
              onClick={updateFilter(type.value, type.label)}
              className="focus:outline-none focus:ring-4 rounded-full"
            >
              <EventBadge
                eventType={type.value}
                cross
                invert={filter == type.value}
                text={type.label}
              />
            </button>
          ))}
        </div>
      </section>

      {/* <pre>{JSON.stringify(upcomingEvents, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(pastEvents, null, 2)}</pre> */}
      {Object.keys(upcomingEvents).length > 0 && (
        <UpcomingEvents events={upcomingEvents} />
      )}
      {pastEvents.length > 0 && (
        <PastEvents title={title} events={pastEvents} />
      )}
    </Layout>
  );
}
