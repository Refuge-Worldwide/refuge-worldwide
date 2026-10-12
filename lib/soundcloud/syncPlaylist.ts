import { client } from "@/lib/contentful/client";
import { resolve, soundcloudTrackKey, updatePlaylist } from ".";
import { getSoundcloudUserToken } from "./userToken";

const RESOLVE_BATCH = 10;
const SHOW_LOOKUP_BATCH = 100;

export type PlaylistToSync = {
  title: string;
  soundcloudLink: string;
  showIds: string[];
};

export type PlaylistSyncResult = {
  tracks: number;
  failedShows: string[];
  changed: boolean;
};

type ShowLink = { title: string; mixcloudLink?: string };

async function getShowLinks(ids: string[]) {
  const byId = new Map<string, ShowLink>();
  for (let i = 0; i < ids.length; i += SHOW_LOOKUP_BATCH) {
    const { items } = await client.getEntries({
      content_type: "show",
      "sys.id[in]": ids.slice(i, i + SHOW_LOOKUP_BATCH).join(","),
      select: "sys.id,fields.title,fields.mixcloudLink",
      limit: SHOW_LOOKUP_BATCH,
    } as any);
    for (const item of items) byId.set(item.sys.id, item.fields as ShowLink);
  }
  return byId;
}

export async function syncPlaylistToSoundcloud({
  soundcloudLink,
  showIds,
}: PlaylistToSync): Promise<PlaylistSyncResult> {
  const token = await getSoundcloudUserToken();
  const scPlaylist = await resolve(token, soundcloudLink);

  if (!scPlaylist?.id) {
    throw new Error(`Could not resolve SoundCloud playlist: ${soundcloudLink}`);
  }

  const existingIds: number[] = [];
  const existingByUrl = new Map<string, number>();
  for (const t of scPlaylist.tracks ?? []) {
    if (!t?.id) continue;
    existingIds.push(t.id);
    if (t.permalink_url)
      existingByUrl.set(soundcloudTrackKey(t.permalink_url), t.id);
  }

  const showsById = await getShowLinks(showIds);
  const shows = showIds.map((id) => showsById.get(id)).filter(Boolean);
  const failedShows: string[] = [];

  const trackIdFor = async (show: ShowLink) => {
    if (!show.mixcloudLink?.includes("soundcloud.com")) {
      failedShows.push(`${show.title} (no SoundCloud link)`);
      return null;
    }

    const existing = existingByUrl.get(soundcloudTrackKey(show.mixcloudLink));
    if (existing) return existing;

    try {
      const track = await resolve(token, show.mixcloudLink);
      if (track?.id) return track.id as number;
    } catch {}

    failedShows.push(show.title);
    return null;
  };

  const trackIds: number[] = [];
  for (let i = 0; i < shows.length; i += RESOLVE_BATCH) {
    const batch = await Promise.all(
      shows.slice(i, i + RESOLVE_BATCH).map(trackIdFor)
    );
    trackIds.push(...batch.filter((id): id is number => id != null));
  }

  const changed =
    trackIds.length !== existingIds.length ||
    trackIds.some((id, i) => id !== existingIds[i]);

  if (changed) {
    await updatePlaylist(
      token,
      scPlaylist.id,
      trackIds.map((id) => ({ id }))
    );
  }

  return { tracks: trackIds.length, failedShows, changed };
}
