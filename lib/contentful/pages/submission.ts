import { graphql } from "..";
import { SubmissionPageData } from "../../../types/shared";
import { extractPage, extractCollection } from "../../../util";
import { DropdownArtistEntry } from "../../../types/shared";

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

export async function getAllArtists(limit: number, skip: number) {
  const AllArtistsQuery = /* GraphQL */ `
    query AllArtistsQuery($limit: Int, $skip: Int) {
      artistCollection(order: name_ASC, limit: $limit, skip: $skip) {
        items {
          sys {
            id
          }
          name
        }
      }
    }
  `;

  const data = await graphql(AllArtistsQuery, {
    variables: { limit, skip },
  });

  return extractCollection<DropdownArtistEntry>(data, "artistCollection");
}

// export async function getArtistsPage(
//   role: boolean,
//   limit: number,
//   skip: number
// ) {
//   const ArtistsPageQuery = /* GraphQL */ `
//     query ArtistsPageQuery($limit: Int, $skip: Int, $role: Boolean) {
//       artistCollection(
//         order: name_ASC
//         limit: $limit
//         skip: $skip
//         where: { role: $role }
//       ) {
//         items {
//           ...AllArtistFragment
//         }
//       }
//     }

//     ${AllArtistFragment}
//   `;

//   const data = await graphql(ArtistsPageQuery, {
//     variables: { limit, skip, role },
//   });

//   return extractCollection<AllArtistEntry>(data, "artistCollection");
// }
