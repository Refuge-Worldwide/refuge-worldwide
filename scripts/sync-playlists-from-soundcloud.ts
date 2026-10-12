import "./loadEnv";
import { createClient } from "contentful-management";
import { graphql } from "../lib/contentful";
import { getAllEntries } from "../lib/contentful/client";
import { getPlaylists } from "../lib/contentful/pages/playlists";
import { getAccessToken, resolve, soundcloudTrackKey } from "../lib/soundcloud";
import { extractCollection } from "../util";

const args = process.argv.slice(2);
const write = args.includes("--write");
const allowMissing = args.includes("--allow-missing");
const slugArgs = args.filter((a) => !a.startsWith("--"));

const AllPlaylistsQuery = /* GraphQL */ `
  query AllPlaylistsForSyncQuery {
    playlistCollection(limit: 100) {
      items {
        sys {
          id
        }
        title
        slug
        soundcloudLink
      }
    }
  }
`;

type Playlist = {
  sys: { id: string };
  title: string;
  slug: string;
  soundcloudLink: string | null;
};

async function main() {
  const all = extractCollection<Playlist>(
    await graphql(AllPlaylistsQuery),
    "playlistCollection"
  );

  const wanted = slugArgs.length
    ? new Set(slugArgs)
    : new Set((await getPlaylists(100, 0)).map((p) => p.slug));

  const playlists = all.filter((p) => wanted.has(p.slug) && p.soundcloudLink);

  if (!playlists.length) {
    console.log("No matching playlists with a soundcloudLink");
    return;
  }

  const shows = await getAllEntries<any>("show", 1000, {
    select: "sys.id,fields.mixcloudLink,fields.internal",
  } as any);
  const showByUrl = new Map<string, string>();
  const showByInternal = new Map<string, string>();
  const showLabel = new Map<string, string>();
  for (const show of shows) {
    const { mixcloudLink, internal } = show.fields as any;
    showLabel.set(show.sys.id, internal ?? mixcloudLink ?? show.sys.id);
    if (mixcloudLink)
      showByUrl.set(soundcloudTrackKey(mixcloudLink), show.sys.id);
    if (internal) showByInternal.set(internal.toLowerCase(), show.sys.id);
  }

  const token = await getAccessToken();

  const mgmt = createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
  });
  const env = await (
    await mgmt.getSpace(process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID)
  ).getEnvironment(process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID);

  console.log(write ? "WRITING to Contentful\n" : "Dry run (add --write)\n");

  for (const playlist of playlists) {
    const label = `[${playlist.slug}]`;

    try {
      const scPlaylist = await resolve(token, playlist.soundcloudLink);
      const tracks: Array<{ permalink_url?: string; title?: string }> =
        scPlaylist.tracks ?? [];

      if (tracks.length !== scPlaylist.track_count) {
        console.log(
          `${label} skipped: got ${tracks.length} of ${scPlaylist.track_count} tracks from SoundCloud`
        );
        continue;
      }

      const unmatched: string[] = [];
      const wrongLink: string[] = [];
      const showIds: string[] = [];
      for (const t of tracks) {
        const byUrl =
          t.permalink_url && showByUrl.get(soundcloudTrackKey(t.permalink_url));
        const byName = t.title && showByInternal.get(t.title.toLowerCase());
        if (byUrl) showIds.push(byUrl);
        else if (byName) {
          showIds.push(byName);
          wrongLink.push(`${t.title} -> should be ${t.permalink_url}`);
        } else unmatched.push(t.title ?? t.permalink_url ?? "unknown");
      }

      console.log(
        `${label} ${tracks.length} tracks, ${showIds.length} matched, ${unmatched.length} unmatched, ${wrongLink.length} wrong link`
      );
      unmatched.forEach((title) => console.log(`    no show: ${title}`));
      wrongLink.forEach((line) => console.log(`    show link wrong: ${line}`));

      const entry = await env.getEntry(playlist.sys.id);
      const current: string[] = (entry.fields.shows?.["en-US"] ?? []).map(
        (link: { sys: { id: string } }) => link.sys.id
      );
      const added = showIds.filter((id) => !current.includes(id));
      const removed = current.filter((id) => !showIds.includes(id));
      console.log(
        `    contentful: ${current.length} -> ${showIds.length} shows (+${added.length} / -${removed.length})`
      );
      removed.forEach((id) =>
        console.log(`    removed from contentful: ${showLabel.get(id) ?? id}`)
      );

      if (!write) continue;

      if ((unmatched.length || wrongLink.length) && !allowMissing) {
        console.log(
          `${label} not written: fix the shows above first (or --allow-missing)`
        );
        continue;
      }

      if (entry.isUpdated()) {
        console.log(
          `${label} not written: has unpublished changes in Contentful`
        );
        continue;
      }

      if (
        current.length === showIds.length &&
        current.every((id, i) => id === showIds[i])
      ) {
        console.log(`${label} already up to date`);
        continue;
      }

      entry.fields.shows = {
        "en-US": showIds.map((id) => ({
          sys: { type: "Link", linkType: "Entry", id },
        })),
      };
      const updated = await entry.update();
      await updated.publish();
      console.log(`${label} updated and published`);
    } catch (error) {
      console.log(`${label} error: ${error}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
