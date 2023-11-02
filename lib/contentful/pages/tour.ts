import { graphql } from "..";
import { TourPageData } from "../../../types/shared";
import { extractPage } from "../../../util";

export async function getTourPage(preview: boolean) {
  const TourPageQuery = /* GraphQL */ `
    query TourPageQuery($preview: Boolean) {
      pageTourWorkshopSignup(id: "6BkVDmBaiBjjPsosoHQCkU", preview: $preview) {
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
  `;

  const data = await graphql(TourPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<TourPageData>(data, "pageTourWorkshopSignup");
}

export async function getAxelPage(preview: boolean) {
  const AxelPageQuery = /* GraphQL */ `
    query AxelPageQuery($preview: Boolean) {
      pageTourWorkshopSignup(id: "6m5NBRavUFjf4sBUxFb9eb", preview: $preview) {
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
  `;

  const data = await graphql(AxelPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<TourPageData>(data, "pageTourWorkshopSignup");
}
