import { graphql } from "..";
import { SubmissionPageData } from "../../../types/shared";
import { extractPage } from "../../../util";

export async function getSubmissionPage(preview: boolean) {
  const SubmissionPageQuery = /* GraphQL */ `
    query SubmissionPageQuery($preview: Boolean) {
      pageSubmission(id: "7t2jOQoBCZ6sGK4HgBZZ42", preview: $preview) {
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

  const data = await graphql(SubmissionPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<SubmissionPageData>(data, "pageSubmission");
}
