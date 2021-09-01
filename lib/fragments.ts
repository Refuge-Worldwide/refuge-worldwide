export const ArtistFragment = /* GraphQL */ `
  fragment ArtistFragment on Artist {
    name
    slug
    isResident: role
    photo {
      sys {
        id
      }
      title
      description
      url
      width
      height
    }
  }
`;
