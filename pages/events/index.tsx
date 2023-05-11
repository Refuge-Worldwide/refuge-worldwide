import UpcomingEvents from "../../views/events/upcomingEvents";
import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import Pill from "../../components/pill";
import PageMeta from "../../components/seo/page";
import { getEventsPage } from "../../lib/contentful/pages/events";

export async function getStaticProps({ preview = false }) {
  return {
    props: { preview, ...(await getEventsPage(preview)) },
  };
}

export default function NewsPage({
  upcomingEvents,
  pastEvents,
  preview,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="Events | Refuge Worldwide" path="events/" />

      <section className="hidden px-4 pt-4">
        <Pill>
          <h1>Events</h1>
        </Pill>
      </section>
      <UpcomingEvents upcomingEvents={upcomingEvents} />
    </Layout>
  );
}
