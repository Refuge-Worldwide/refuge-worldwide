import { graphql } from "..";
import { EventInterface } from "../../../types/shared";
import { extractCollection, extractCollectionItem } from "../../../util";
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

export async function getEvents(
  preview: boolean,
  limit?: number,
  skip?: number
) {
  const EventsQuery = /* GraphQL */ `
    query EventsQuery($preview: Boolean, $limit: Int, $skip: Int) {
      eventCollection(
        order: date_DESC
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

  const res = await graphql(EventsQuery, {
    variables: { preview, limit, skip },
    preview,
  });

  return extractCollection<EventInterface>(res, "eventCollection");
}

export async function getEventsPage(preview: boolean) {
  return {
    events: await getEvents(preview, EVENTS_PAGE_SIZE),
  };
}
