import UpcomingEvents from "../../views/events/upcomingEvents";
import PastEvents from "../../views/events/pastEvents";
import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import Pill from "../../components/pill";
import PageMeta from "../../components/seo/page";
import { getEventsPage } from "../../lib/contentful/pages/events";
import dayjs from "dayjs";
import Badge from "../../components/badge";

export async function getStaticProps({ preview = false }) {
  return {
    props: { preview, ...(await getEventsPage(preview)) },
  };
}

export default function NewsPage({
  events,
  preview,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const now = dayjs();
  let upcomingEvents = {};
  let pastEvents = [];
  let reachedPastEvents = false;

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

  return (
    <Layout preview={preview}>
      <PageMeta title="Events | Refuge Worldwide" path="events/" />

      <section className="hidden px-4 pt-4 md:flex justify-between bg-blue">
        <h1 className="hidden">Events</h1>
        <Pill outline>
          <h2>Upcoming events</h2>
        </Pill>
        <div className="h-5 md:hidden" />
        <div className="py-2 px-4 border-2 border-black rounded-full w-fit flex space-x-2 grow-1 relative">
          FILTER
          <button className="focus:outline-none focus:ring-4 rounded-full">
            <Badge invert={true} cross text="Workshops" />
          </button>
          <button className="focus:outline-none focus:ring-4 rounded-full">
            <Badge invert={true} cross text="Parties" />
          </button>
          <button className="focus:outline-none focus:ring-4 rounded-full">
            <Badge invert={true} cross text="Fundraisers" />
          </button>
          <button className="focus:outline-none focus:ring-4 rounded-full">
            <Badge invert={true} cross text="Hang outs" />
          </button>
        </div>
      </section>

      {/* <pre>{JSON.stringify(upcomingEvents, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(pastEvents, null, 2)}</pre> */}
      {Object.keys(upcomingEvents).length > 0 && (
        <UpcomingEvents events={upcomingEvents} />
      )}
      {pastEvents.length > 0 && <PastEvents events={pastEvents} />}
    </Layout>
  );
}
