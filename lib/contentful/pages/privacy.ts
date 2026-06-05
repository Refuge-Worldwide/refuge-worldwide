import { graphql } from "..";
import { AboutPageData } from "../../../types/shared";
import { extractPage } from "../../../util";

export async function getPrivacyPage(preview: boolean) {
  const PrivacyPageQuery = /* GraphQL */ `
    query PrivacyPageQuery($preview: Boolean) {
      pagePrivacyPolicy(id: "9U21ZsbJHQmsgBTs3LSnB", preview: $preview) {
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

  return extractPage<AboutPageData>(data, "pagePrivacyPolicy");
}
