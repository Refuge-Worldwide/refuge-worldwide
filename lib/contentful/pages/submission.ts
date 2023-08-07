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

export async function getArtists(limit: number, skip: number) {
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

export async function getAllArtists() {
  const artists = await getArtists(1000, 0);
  const artistsTwo = await getArtists(1000, 1000);
  const artistsThree = await getArtists(1000, 2000);

  const allArtists = artists.concat(artistsTwo.concat(artistsThree));

  const mappedArtists = allArtists.map((artists) => ({
    value: artists.sys.id,
    label: artists.name,
  }));

  return mappedArtists;
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
