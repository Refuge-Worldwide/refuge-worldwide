import { graphql } from "..";
import { SupportPageData } from "../../../types/shared";
import { extractPage } from "../../../util";

export async function getSupportPage(preview: boolean) {
  const SupportPageQuery = /* GraphQL */ `
    query SupportPageQuery($preview: Boolean) {
      pageSupport(id: "Aa4GRMf6fuDtkH0UhkX19", preview: $preview) {
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

  const data = await graphql(SupportPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<SupportPageData>(data, "pageSupport");
}
