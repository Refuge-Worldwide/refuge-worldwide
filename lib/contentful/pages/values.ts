import { graphql } from "..";
import { ValuesPageData } from "../../../types/shared";
import { extractPage } from "../../../util";

export async function getValuesPage(preview: boolean) {
  const ValuesPageQuery = /* GraphQL */ `
    query ValuesPageQuery($preview: Boolean) {
      pageValues(id: "3RTvgTjZucRIHWeLKceq9S", preview: $preview) {
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

  const data = await graphql(ValuesPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<ValuesPageData>(data, "pageValues");
}
