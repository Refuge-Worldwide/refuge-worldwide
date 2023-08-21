import { graphql } from "..";
import { EventInterface, EventPageData } from "../../../types/shared";
import { extractCollection, extractPage } from "../../../util";
import { EventFragment } from "../fragments";
import dayjs from "dayjs";

export const EVENTS_PAGE_SIZE = 24;

export async function getUpcomingEvents(
  preview: boolean,
  limit?: number,
  skip?: number
) {
  const UpcomingEventsQuery = /* GraphQL */ `
    query UpcomingEventsQuery($preview: Boolean, $limit: Int, $skip: Int) {
      eventCollection(
        order: date_ASC
        preview: $preview
        limit: $limit
        skip: $skip
      ) {
        items {
          ...EventFragment
        }
      }
    }

    ${EventFragment}
  `;

  const res = await graphql(UpcomingEventsQuery, {
    variables: { preview, limit, skip },
    preview,
  });

  const upcomingEvents = extractCollection<EventInterface>(
    res,
    "eventCollection"
  );
  let upcomingEventsByMonth = [];

  upcomingEvents.forEach((event) => {
    const month = dayjs(event.date).format("MMMM");
    const i = upcomingEventsByMonth.findIndex((e) => e.month === month);
    if (i > -1) {
      upcomingEventsByMonth[i].events.push(event);
    } else {
      const newMonth = {
        month: month,
        events: [event],
      };
      upcomingEventsByMonth.push(newMonth);
    }
  });

  return upcomingEventsByMonth;
}

export async function getEventsPage(preview: boolean) {
  const EventsQuery = /* GraphQL */ `
    query EventsQuery($preview: Boolean) {
      eventCollection(order: date_DESC, preview: $preview) {
        items {
          ...EventFragment
        }
      }

      pageEvents(id: "lKe72za4E77V7CaGNcGGS") {
        featuredEventsCollection(preview: $preview) {
          items {
            ...EventFragment
          }
        }
      }
    }

    ${EventFragment}
  `;

  const data = await graphql(EventsQuery, {
    variables: { preview },
    preview,
  });

  console.log(data.featuredEventsCollection);

  return {
    featuredEvents: extractPage<EventPageData>(data, "pageEvents")
      .featuredEventsCollection.items,
    events: extractCollection<EventInterface>(data, "eventCollection"),
  };
}
