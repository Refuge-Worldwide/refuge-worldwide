import { graphql } from "..";
import { EventInterface, WorkshopInterface } from "../../../types/shared";
import { extractCollection, extractCollectionItem } from "../../../util";
import { EventFragment } from "../fragments";
import dayjs from "dayjs";

export const WORKSHOPS_PAGE_SIZE = 24;

export async function getWorkshops(
  preview: boolean,
  limit?: number,
  skip?: number
) {
  const EventsQuery = /* GraphQL */ `
    query EventsQuery($preview: Boolean, $limit: Int, $skip: Int) {
      eventCollection(
        order: date_DESC
        where: { eventType: "Workshop", signUpForm: true }
        preview: $preview
        limit: $limit
        skip: $skip
      ) {
        items {
          ...EventFragment
          deadlineDate
          workshopSignupInfo {
            json
            links {
              assets {
                block {
                  sys {
                    id
                  }
                  contentType
                  title
                  description
                  url
                  width
                  height
                }
              }
            }
          }
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

export async function getWorkshopsPage(preview: boolean) {
  return {
    workshops: await getWorkshops(preview, WORKSHOPS_PAGE_SIZE),
  };
}

export async function getWorkshopPageSingle(slug: string, preview: boolean) {
  const WorkshopPageSingleQuery = /* GraphQL */ `
    query WorkshopPageSingleQuery($slug: String, $preview: Boolean) {
      workshopCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
        items {
          title
          slug
          tallyFormLink
          coverImage {
            sys {
              id
            }
            title
            description
            url
            width
            height
          }
          content {
            json
            links {
              assets {
                block {
                  sys {
                    id
                  }
                  contentType
                  title
                  description
                  url
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await graphql(WorkshopPageSingleQuery, {
    variables: { slug, preview },
    preview,
  });

  const entry = extractCollectionItem<WorkshopInterface>(
    res,
    "workshopCollection"
  );

  if (!entry) {
    throw new Error(`No workshop found for slug '${slug}'`);
  }

  return {
    workshop: entry,
  };
}
