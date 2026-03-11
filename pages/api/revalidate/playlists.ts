import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase/client";
import { graphql } from "../../../lib/contentful";
import { extractCollectionItem } from "../../../util";
import dayjs from "dayjs";

async function getSoundcloudAccessToken(): Promise<string> {
  const now = dayjs();

  const { data: accessTokens } = await supabase
    .from("accessTokens")
    .select("application, token, refresh_token, expires")
    .eq("application", "soundcloud")
    .limit(1)
    .single();

  if (now.isAfter(dayjs(accessTokens.expires))) {
    const response = await fetch("https://api.soundcloud.com/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.SC_CLIENT_ID,
        client_secret: process.env.SC_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    const body = await response.json();

    await supabase
      .from("accessTokens")
      .update({
        token: body.access_token,
        refresh_token: body.refresh_token,
        expires: now.add(body.expires_in - 30, "seconds").toISOString(),
      })
      .eq("application", "soundcloud")
      .select();

    return body.access_token;
  }

  return accessTokens.token;
}

async function resolveSoundcloudUrl(
  url: string,
  accessToken: string
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.soundcloud.com/resolve?url=${url}`,
      {
        method: "GET",
        headers: {
          Authorization: `OAuth ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) return null;

    const body = await response.json();
    return body.id ?? null;
  } catch {
    return null;
  }
}

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

    const accessToken = await getSoundcloudAccessToken();

    // Resolve the Contentful playlist's soundcloudLink to a SC playlist ID
    const scPlaylistId = await resolveSoundcloudUrl(
      playlist.soundcloudLink,
      accessToken
    );

    if (!scPlaylistId) {
      console.error(
        `Could not resolve SoundCloud playlist: ${playlist.soundcloudLink}`
      );
      return res
        .status(500)
        .json({ message: "Could not resolve SoundCloud playlist" });
    }

    // Resolve each show's mixcloudLink (SoundCloud URL) to a SC track ID in parallel
    const trackResults = await Promise.all(
      playlist.showsCollection.items
        .filter((show) => show.mixcloudLink)
        .map((show) => resolveSoundcloudUrl(show.mixcloudLink, accessToken))
    );

    const tracks = trackResults
      .filter((id): id is number => id !== null)
      .map((id) => ({ id }));

    // Update the SoundCloud playlist track list
    const updateResponse = await fetch(
      `https://api.soundcloud.com/playlists/${scPlaylistId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `OAuth ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlist: { tracks } }),
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.error("SoundCloud playlist update failed:", error);
      return res.status(500).json({ message: "SoundCloud update failed" });
    }

    return res.json({ revalidated: true, synced: true, tracks: tracks.length });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error syncing playlist");
  }
}
