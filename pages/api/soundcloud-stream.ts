import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase/client";
import dayjs from "dayjs";

const APPLICATION = "soundcloud-oauth";

const getAccessToken = async (): Promise<string> => {
  const now = dayjs();

  const { data: row } = await supabase
    .from("accessTokens")
    .select("token, expires")
    .eq("application", APPLICATION)
    .limit(1)
    .single();

  if (row?.token && now.isBefore(dayjs(row.expires))) {
    console.log("[soundcloud-stream] Using cached SoundCloud token");
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

  if (saveError) console.error("[soundcloud-stream] save error:", saveError);

  return body.access_token;
};

const cleanSoundcloudUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    return parsed.toString();
  } catch {
    return url;
  }
};

const resolveTrack = async (token: string, url: string) => {
  const response = await fetch(
    `https://api.soundcloud.com/resolve?url=${encodeURIComponent(
      cleanSoundcloudUrl(url)
    )}`,
    { headers: { Authorization: `OAuth ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Failed to resolve track: ${response.status}`);
  }

  return response.json();
};

const getStreams = async (
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

const selectStreamUrl = (streams: Record<string, string>): string => {
  const preferred = ["hls_aac_160_url", "hls_aac_96_url"];

  for (const key of preferred) {
    if (streams[key]) return streams[key];
  }

  const fallback = Object.values(streams).find(Boolean);
  if (fallback) return fallback;

  throw new Error("No stream URL available");
};

const getActualStreamUrl = async (
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query as { url: string };

  if (!url) {
    return res
      .status(400)
      .json({ error: "Missing required query parameter: url" });
  }

  try {
    const token = await getAccessToken();
    const track = await resolveTrack(token, url);
    const streams = await getStreams(token, track.id);
    const streamApiUrl = selectStreamUrl(streams);
    const streamUrl = await getActualStreamUrl(token, streamApiUrl);

    // Cache at Vercel's CDN edge for 45 min. stale-while-revalidate allows
    // serving the cached response while a fresh one is fetched in the background.
    res.setHeader("Cache-Control", "s-maxage=2700, stale-while-revalidate=300");

    // SoundCloud artwork is 100x100 by default (-large). Replace with -t200x200 for a crisper thumbnail.
    const artwork = track.artwork_url
      ? track.artwork_url.replace("-large", "-t200x200")
      : null;

    return res.status(200).json({
      id: track.id,
      streamUrl,
      waveform: track.waveform_url,
      artwork,
    });
  } catch (error) {
    console.error("[soundcloud-stream]", error);
    return res.status(500).json({ error: String(error) });
  }
}
