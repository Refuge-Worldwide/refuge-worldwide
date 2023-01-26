import { graphql } from "..";
import { SubmissionPageData } from "../../../types/shared";
import { extractPage } from "../../../util";

export async function getSubmissionPage(preview: boolean) {
  const SubmissionPageQuery = /* GraphQL */ `
    query SubmissionPageQuery($preview: Boolean) {
      pageSubmission(id: "1eohijLMd2Q38BVq0D713p", preview: $preview) {
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
        liveShows {
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
        liveShows2 {
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
        preRecords {
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
        uploadLink
      }
    }
  `;

  const data = await graphql(SubmissionPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<SubmissionPageData>(data, "pageSubmission");
}
