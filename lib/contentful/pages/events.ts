import { graphql } from "..";
import { EventInterface } from "../../../types/shared";
import { extractCollection, extractCollectionItem } from "../../../util";
import { EventFragment } from "../fragments";

export const EVENTS_PAGE_SIZE = 12;

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

  return extractCollection<EventInterface>(res, "eventCollection");
}

export async function getPastEvents(
  preview: boolean,
  limit?: number,
  skip?: number
) {
  const PastQuery = /* GraphQL */ `
    query PastQuery($preview: Boolean, $limit: Int, $skip: Int) {
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

  const res = await graphql(PastQuery, {
    variables: { preview, limit, skip },
    preview,
  });

  return extractCollection<EventInterface>(res, "eventCollection");
}

export async function getEventsPage(preview: boolean) {
  return {
    upcomingEvents: await getUpcomingEvents(preview),
    pastEvents: await getPastEvents(preview, EVENTS_PAGE_SIZE),
  };
}
