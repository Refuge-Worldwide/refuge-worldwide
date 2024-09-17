import { graphql } from "..";
import { AboutPageData } from "../../../types/shared";
import { extractPage } from "../../../util";

export async function getNM1BookingPage(preview: boolean) {
  const AboutPageQuery = /* GraphQL */ `
    query AboutPageQuery($preview: Boolean) {
      pageAbout(id: "7nZvcNfNVRrZGs6x42RV3l", preview: $preview) {
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

  const data = await graphql(AboutPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<AboutPageData>(data, "pageAbout");
}
