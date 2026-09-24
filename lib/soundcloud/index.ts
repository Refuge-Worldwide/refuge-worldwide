import { getCache } from "@vercel/functions";

const CACHE_KEY = "soundcloud-oauth-token";

type CachedToken = { token: string; expiresAt: number };

// quick copy in memory so we don't hit the cache every time
let memoryToken: CachedToken | null = null;

const cleanUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    return parsed.toString();
  } catch {
    return url;
  }
};

// soundcloud limits new tokens, so we keep one in the vercel cache
export const getAccessToken = async (): Promise<string> => {
  if (memoryToken && Date.now() < memoryToken.expiresAt) {
    return memoryToken.token;
  }

  const cache = getCache();
  const cached = (await cache
    .get(CACHE_KEY)
    .catch(() => null)) as CachedToken | null;

  if (cached?.token && Date.now() < cached.expiresAt) {
    memoryToken = cached;
    return cached.token;
  }

  const response = await fetch("https://api.soundcloud.com/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.SC_CLIENT_ID,
      client_secret: process.env.SC_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  const body = await response.json();

  if (!body.access_token) {
    throw new Error(`Failed to get SoundCloud token: ${JSON.stringify(body)}`);
  }

  // expire a minute early to be safe
  const ttl = Math.max((body.expires_in ?? 3600) - 60, 60);
  const entry: CachedToken = {
    token: body.access_token,
    expiresAt: Date.now() + ttl * 1000,
  };
  memoryToken = entry;

  try {
    await cache.set(CACHE_KEY, entry, { ttl });
  } catch (error) {
    console.error("[soundcloud] token cache error:", error);
  }

  return body.access_token;
};

export const resolve = async (token: string, url: string) => {
  const response = await fetch(
    `https://api.soundcloud.com/resolve?url=${encodeURIComponent(
      cleanUrl(url)
    )}`,
    { headers: { Authorization: `OAuth ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Failed to resolve SoundCloud URL: ${response.status}`);
  }

  return response.json();
};

export const getStreams = async (
  token: string,
  trackId: number
): Promise<Record<string, string>> => {
  const response = await fetch(
    `https://api.soundcloud.com/tracks/${trackId}/streams`,
    { headers: { Authorization: `OAuth ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Failed to get streams: ${response.status}`);
  }

  return response.json();
};

export const selectStreamUrl = (streams: Record<string, string>): string => {
  const preferred = ["hls_aac_160_url", "hls_aac_96_url", "hls_mp3_128_url"];

  for (const key of preferred) {
    if (streams[key]) return streams[key];
  }

  const fallback = Object.values(streams).find(Boolean);
  if (fallback) return fallback;

  throw new Error("No stream URL available");
};

export const getActualStreamUrl = async (
  token: string,
  streamApiUrl: string
): Promise<string> => {
  const response = await fetch(streamApiUrl, {
    headers: { Authorization: `OAuth ${token}` },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Failed to get stream URL: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const json = await response.json();
    return json.url || json.redirectUri || streamApiUrl;
  }

  return response.url;
};

export const updatePlaylist = async (
  token: string,
  playlistId: number,
  tracks: { id: number }[]
): Promise<void> => {
  const response = await fetch(
    `https://api.soundcloud.com/playlists/${playlistId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `OAuth ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playlist: { tracks } }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SoundCloud playlist update failed: ${error}`);
  }
};
