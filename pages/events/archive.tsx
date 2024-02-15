import UpcomingEvents from "../../views/events/upcomingEvents";
import PastEvents from "../../views/events/pastEvents";
import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import Pill from "../../components/pill";
import PageMeta from "../../components/seo/page";
import { getEventsPage } from "../../lib/contentful/pages/events";
import dayjs from "dayjs";
import { useState, useEffect } from "react";

export async function getStaticProps({ preview = false }) {
  return {
    props: { preview, ...(await getEventsPage(preview)) },
  };
}

export default function NewsAchivePage({
  events,
  preview,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const now = dayjs().startOf("day");
  const [title, setTitle] = useState<string>("events");
  const [pastEvents, setPastEvents] = useState([]);

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
    setPastEvents(pEvents);
  };

  useEffect(() => {
    sortEvents(events);
  }, []);

  return (
    <Layout preview={preview}>
      <PageMeta title="Past Events | Refuge Worldwide" path="events/archive" />
      <div className="p-4 sm:p-8 border-b-2">
        <div className="max-w-[1229px] mx-auto">
          <Pill outline>
            <h1>Past Events</h1>
          </Pill>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto">
        {pastEvents.length > 0 ? (
          <PastEvents title={title} events={pastEvents} />
        ) : (
          <div className="">
            <div className="max-w-screen-xl mx-auto">
              <p className="p-4 sm:p-8 text-smedium font-medium md:font-light md:text-small">
                No {title} in the archive, please check back soon.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="h-10 sm:h-16" />
    </Layout>
  );
}
