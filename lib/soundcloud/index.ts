import { supabase } from "../supabase/client";
import dayjs from "dayjs";

const APPLICATION = "soundcloud-oauth";

const cleanUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    return parsed.toString();
  } catch {
    return url;
  }
};

export const getAccessToken = async (): Promise<string> => {
  const now = dayjs();

  const { data: row } = await supabase
    .from("accessTokens")
    .select("token, expires")
    .eq("application", APPLICATION)
    .limit(1)
    .single();

  if (row?.token && now.isBefore(dayjs(row.expires))) {
    return row.token;
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

  const expiresIn = body.expires_in ?? 3600;
  const tokenData = {
    token: body.access_token,
    refresh_token: body.refresh_token ?? null,
    expires: now.add(expiresIn - 30, "seconds").toISOString(),
  };

  const { error: saveError } = row
    ? await supabase
        .from("accessTokens")
        .update(tokenData)
        .eq("application", APPLICATION)
    : await supabase
        .from("accessTokens")
        .insert({ application: APPLICATION, ...tokenData });

  if (saveError) console.error("[soundcloud] Supabase save error:", saveError);

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
