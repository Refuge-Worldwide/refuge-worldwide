import { NextApiRequest, NextApiResponse } from "next";
// import { createClient } from "contentful-management";
import { client } from "../../../lib/contentful/client";
import { graphql } from "../../../lib/contentful";
import { getAccessToken, resolve } from "../../../lib/soundcloud";
import { extractCollection } from "../../../util";

const AllPlaylistsQuery = /* GraphQL */ `
  query AllPlaylistsForSyncQuery {
    playlistCollection(limit: 20) {
      items {
        sys {
          id
        }
        slug
        soundcloudLink
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const dryRun = req.query.dryRun === "true";

  try {
    // 1. Fetch all playlists from Contentful
    const cfRes = await graphql(AllPlaylistsQuery);
    const playlists = extractCollection<{
      sys: { id: string };
      slug: string;
      soundcloudLink: string;
    }>(cfRes, "playlistCollection").filter((p) => p.soundcloudLink);

    if (playlists.length === 0) {
      return res.json({
        synced: false,
        message: "No playlists with a soundcloudLink found",
      });
    }

    // 2. Fetch ALL shows (paginated) and build lookup maps: by URL and by internal name
    const showItems: any[] = [];
    let skip = 0;
    while (true) {
      // @ts-ignore – select is valid but not typed strictly in this SDK version
      const page = await client.getEntries({
        content_type: "show",
        select: "sys.id,fields.mixcloudLink,fields.internal",
        limit: 1000,
        skip,
      });
      showItems.push(...page.items);
      if (showItems.length >= page.total) break;
      skip += page.items.length;
    }

    const stripQuery = (url: string) =>
      url.split("?")[0].replace(/\/$/, "").toLowerCase();

    const showByUrl = new Map<string, string>();
    const showByInternal = new Map<string, string>();
    for (const show of showItems) {
      const fields = show.fields as any;
      const mixcloudLink = fields.mixcloudLink as string | undefined;
      const internal = fields.internal as string | undefined;
      if (mixcloudLink) showByUrl.set(stripQuery(mixcloudLink), show.sys.id);
      if (internal) showByInternal.set(internal.toLowerCase(), show.sys.id);
    }

    // 3. Get SoundCloud token
    const token = await getAccessToken();

    // 4. Set up Contentful management client
    // const mgmt = createClient({
    //   accessToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
    // });
    // const space = await mgmt.getSpace(
    //   process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID
    // );
    // const env = await space.getEnvironment(
    //   process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID
    // );

    // 5. Sync each playlist
    const results = [];

    for (const playlist of playlists) {
      try {
        // Resolve the SC playlist URL to get its track list
        const scPlaylist = await resolve(token, playlist.soundcloudLink);
        const tracks: Array<{ permalink_url?: string; title?: string }> =
          scPlaylist.tracks ?? [];

        // Match SC tracks to Contentful shows: URL first, then internal name fallback
        const unmatched: Array<{ scTitle: string; scUrl?: string }> = [];
        const showRefs = tracks
          .map((t) => {
            const scUrl = t.permalink_url
              ? stripQuery(t.permalink_url)
              : undefined;
            const scTitle = t.title ?? "";
            const id =
              (scUrl ? showByUrl.get(scUrl) : undefined) ??
              (scTitle ? showByInternal.get(scTitle.toLowerCase()) : undefined);
            if (!id)
              unmatched.push({ scTitle, scUrl: t.permalink_url ?? undefined });
            return id;
          })
          .filter((id): id is string => id !== undefined)
          .map((id) => ({
            sys: { type: "Link" as const, linkType: "Entry" as const, id },
          }));

        // if (!dryRun) {
        //   const entry = await env.getEntry(playlist.sys.id);
        //   entry.fields.shows = { "en-US": showRefs };
        //   const updated = await entry.update();
        //   await updated.publish();
        // }

        results.push({
          slug: playlist.slug,
          scTracks: tracks.length,
          matched: showRefs.length,
          unmatched: unmatched.length,
          unmatchedTitles: unmatched.map((u) => u.scTitle),
        });
      } catch (err) {
        results.push({
          slug: playlist.slug,
          error: String(err),
        });
      }
    }

    return res.json({ synced: !dryRun, dryRun, results });
  } catch (error) {
    console.error("[sync-playlists-from-soundcloud] Error:", error);
    return res.status(500).json({ error: String(error) });
  }
}
