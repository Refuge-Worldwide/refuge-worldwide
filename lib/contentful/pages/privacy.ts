import { graphql } from "..";
import { AboutPageData } from "../../../types/shared";
import { extractPage } from "../../../util";

export async function getPrivacyPage(preview: boolean) {
  const PrivacyPageQuery = /* GraphQL */ `
    query PrivacyPageQuery($preview: Boolean) {
      pageAbout(id: "5z5ZdCi24uu6FRMYY5l5MI", preview: $preview) {
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

  const data = await graphql(PrivacyPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<AboutPageData>(data, "pageAbout");
}
