import { NextApiRequest, NextApiResponse } from "next";
import { graphql } from "../../../lib/contentful";
import {
  getAccessToken,
  resolve,
  updatePlaylist,
} from "../../../lib/soundcloud";
import { extractCollectionItem } from "../../../util";

const PlaylistForSyncQuery = /* GraphQL */ `
  query PlaylistForSyncQuery($slug: String) {
    playlistCollection(where: { slug: $slug }, limit: 1) {
      items {
        soundcloudLink
        showsCollection(limit: 50) {
          items {
            mixcloudLink
          }
        }
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.CF_WEBHOOK_SECRET !== req.headers["webhook_secret"]) {
    return res.status(401).json({ message: "Invalid Secret" });
  }

  try {
    const slug = JSON.parse(req.body)?.fields?.slug?.["en-US"];

    if (!slug) {
      return res.status(400).json({ message: "No slug in payload" });
    }

    // Fetch the full playlist from Contentful to get soundcloudLink and show URLs
    const cfRes = await graphql(PlaylistForSyncQuery, {
      variables: { slug },
    });

    const playlist = extractCollectionItem<{
      soundcloudLink: string;
      showsCollection: { items: Array<{ mixcloudLink: string }> };
    }>(cfRes, "playlistCollection");

    if (!playlist?.soundcloudLink) {
      return res.json({ revalidated: true, synced: false });
    }

    const token = await getAccessToken();

    // Resolve the playlist's soundcloudLink to a SC playlist ID
    const scPlaylist = await resolve(token, playlist.soundcloudLink);

    if (!scPlaylist?.id) {
      console.error(
        `Could not resolve SoundCloud playlist: ${playlist.soundcloudLink}`
      );
      return res
        .status(500)
        .json({ message: "Could not resolve SoundCloud playlist" });
    }

    // Resolve each show's SoundCloud URL to a track ID in parallel, skipping any that fail
    const trackResults = await Promise.allSettled(
      playlist.showsCollection.items
        .filter((show) => show.mixcloudLink)
        .map((show) => resolve(token, show.mixcloudLink))
    );

    const tracks = trackResults
      .filter(
        (r): r is PromiseFulfilledResult<{ id: number }> =>
          r.status === "fulfilled" && r.value?.id != null
      )
      .map((r) => ({ id: r.value.id }));

    await updatePlaylist(token, scPlaylist.id, tracks);

    return res.json({ revalidated: true, synced: true, tracks: tracks.length });
  } catch (error) {
    console.error("[revalidate/playlists] Error:", error);
    return res.status(500).send("Error syncing playlist");
  }
}
