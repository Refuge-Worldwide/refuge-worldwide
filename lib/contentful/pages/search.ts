import dayjs from "dayjs";
import { graphql } from "..";
import {
  ArticleInterface,
  ArtistInterface,
  ShowInterface,
} from "../../../types/shared";
import { extractCollection } from "../../../util";

export interface SearchShowInterface extends ShowInterface {
  type: "SHOW";
}

export interface SearchArtistInterface extends ArtistInterface {
  type: "ARTIST";
  title: string;
}

export interface SearchArticleInterface extends ArticleInterface {
  type: "ARTICLE";
}

export async function getSearchPage() {
  const today = dayjs().format("YYYY-MM-DD");

  const ArticleDataQuery = /* GraphQL */ `
    query ArticleDataQuery {
      articleCollection(limit: 1000, order: date_DESC) {
        items {
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
          title
          slug
          date
          articleType
        }
      }
    }
  `;

  const articleData = await graphql(ArticleDataQuery);

  const ArtistDataQuery = /* GraphQL */ `
    query ArtistDataQuery {
      artistCollection(limit: 1000, order: name_ASC) {
        items {
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
          title: name
          slug
        }
      }
    }
  `;

  const artistData = await graphql(ArtistDataQuery);

  const ShowDataQuery = /* GraphQL */ `
    query ShowDataQuery($today: DateTime) {
      showCollection(
        limit: 1000
        order: date_DESC
        where: { date_lt: $today }
      ) {
        items {
          coverImage {
            sys {
              id
            }
            url
          }
          artistsCollection(limit: 1) {
            items {
              name
            }
          }
          genresCollection(limit: 3) {
            items {
              name
            }
          }
          title
          slug
          date
        }
      }
    }
  `;

  const showData = await graphql(ShowDataQuery, {
    variables: { today },
  });

  const articleCollection = extractCollection<ArticleInterface>(
    articleData,
    "articleCollection"
  ).map((el) => ({ ...el, type: "ARTICLE" })) as SearchArticleInterface[];

  const artistCollection = extractCollection<ArtistInterface>(
    artistData,
    "artistCollection"
  ).map((el) => ({ ...el, type: "ARTIST" })) as SearchArtistInterface[];

  const showCollection = extractCollection<ShowInterface>(
    showData,
    "showCollection"
  ).map((el) => ({
    ...el,
    artist: el.artistsCollection.items[0].name,
    type: "SHOW",
  })) as SearchShowInterface[];

  return [...showCollection, ...articleCollection, ...artistCollection];
}
