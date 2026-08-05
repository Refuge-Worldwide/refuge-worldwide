import { graphql } from "..";
import { PlaylistInterface, PlaylistSchema } from "../../../types/shared";
import {
  extractCollectionItem,
  extractPage,
  placeholderImage,
} from "../../../util";

const PLAYLISTS_PAGE_ID = "66ltrry3HPWOktbkFPI5Ms";

function processPlaylist(playlist: PlaylistInterface): PlaylistSchema {
  return {
    id: playlist.sys.id,
    title: playlist.title,
    slug: playlist.slug,
    description: playlist.description,
    image: playlist.image?.url ?? null,
    soundcloudLink: playlist.soundcloudLink,
    shows: playlist.showsCollection.items.filter(Boolean).map((show) => ({
      id: show.sys.id,
      title: show.title,
      date: show.date,
      slug: show.slug,
      mixcloudLink: show.mixcloudLink,
      coverImage: show.coverImage?.url ?? placeholderImage.url,
      genres: show.genresCollection.items
        .map((genre) => genre?.name)
        .filter(Boolean),
      artwork: show.artwork?.url ?? null,
      audioFile: show.audioFile?.url ?? null,
    })),
  };
}

const PlaylistShowFields = /* GraphQL */ `
  sys {
    id
  }
  title
  date
  slug
  mixcloudLink
  coverImage {
    url
  }
  genresCollection(limit: 9) {
    items {
      name
    }
  }
  artwork {
    url
  }
  audioFile {
    url
  }
`;

export async function getPlaylists(take: number, skip: number) {
  const PlaylistsQuery = /* GraphQL */ `
    query PlaylistsQuery($id: String!, $limit: Int!, $skip: Int!) {
      pagePlaylists(id: $id) {
        playlistsCollection(limit: $limit, skip: $skip) {
          items {
            sys {
              id
            }
            title
            slug
            description {
              json
            }
            image {
              url
            }
            soundcloudLink
          }
        }
      }
    }
  `;

  const res = await graphql(PlaylistsQuery, {
    variables: { id: PLAYLISTS_PAGE_ID, limit: take, skip },
  });

  const page = extractPage<{
    playlistsCollection: { items: Array<PlaylistInterface | null> };
  }>(res, "pagePlaylists");

  return (page?.playlistsCollection?.items ?? [])
    .filter((item): item is PlaylistInterface => Boolean(item))
    .map((item) => ({
      id: item.sys.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      image: item.image?.url ?? null,
      soundcloudLink: item.soundcloudLink,
    }));
}

export async function getPlaylistBySlug(slug: string, preview: boolean) {
  const PlaylistBySlugQuery = /* GraphQL */ `
    query PlaylistBySlugQuery($slug: String, $preview: Boolean) {
      playlistCollection(
        where: { slug: $slug }
        limit: 1
        preview: $preview
      ) {
        items {
          sys {
            id
          }
          title
          slug
          description {
            json
          }
          image {
            url
          }
          soundcloudLink
          showsCollection(limit: 50) {
            items {
              ${PlaylistShowFields}
            }
          }
        }
      }
    }
  `;

  const res = await graphql(PlaylistBySlugQuery, {
    variables: { slug, preview },
    preview,
  });

  const entry = extractCollectionItem<PlaylistInterface>(
    res,
    "playlistCollection"
  );

  if (!entry) {
    throw new Error(`No Playlist found for slug '${slug}'`);
  }

  return processPlaylist(entry);
}
