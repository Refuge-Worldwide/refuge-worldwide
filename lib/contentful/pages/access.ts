import { graphql } from "..";
import { AboutPageData } from "../../../types/shared";
import { extractPage } from "../../../util";

export async function getAccessPage(preview: boolean) {
  const AccessPageQuery = /* GraphQL */ `
    query AccessPageQuery($preview: Boolean) {
      pageAbout(id: "1yGgLGFA8Z3DJyod1A2Jtm", preview: $preview) {
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

  const data = await graphql(AccessPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<AboutPageData>(data, "pageAbout");
}
