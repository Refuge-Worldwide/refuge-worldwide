import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase/client";
import dayjs from "dayjs";

const selectStreamUrl = (streams: Record<string, string>): string => {
  const preferred = [
    "http_mp3_128_url",
    "hls_mp3_128_url",
    "hls_opus_64_url",
    "preview_mp3_128_url",
  ];

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
  const now = dayjs();
  let accessToken = null;

  try {
    const { data: accessTokens } = await supabase
      .from("accessTokens")
      .select("application, token, refresh_token, expires")
      .eq("application", "soundcloud")
      .limit(1)
      .single();

    const isExpired =
      !accessTokens?.expires || now.isAfter(dayjs(accessTokens.expires));

    if (isExpired) {
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
        throw new Error(
          `Failed to get SoundCloud token: ${JSON.stringify(body)}`
        );
      }

      accessToken = body.access_token;
      const expiresIn = body.expires_in ?? 3600;

      await supabase
        .from("accessTokens")
        .upsert({
          application: "soundcloud",
          token: body.access_token,
          refresh_token: body.refresh_token ?? null,
          expires: now.add(expiresIn - 30, "seconds").toISOString(),
        })
        .eq("application", "soundcloud");
    } else {
      accessToken = accessTokens.token;
    }

    const { url } = req.query as { url: string };

    const trackResponse = await fetch(
      `https://api.soundcloud.com/resolve?url=${url}`,
      {
        headers: {
          Authorization: `OAuth ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!trackResponse.ok) {
      return res
        .status(trackResponse.status)
        .json({ error: "Failed to resolve track" });
    }

    const track = await trackResponse.json();

    const streamsResponse = await fetch(
      `https://api.soundcloud.com/tracks/${track.id}/streams`,
      { headers: { Authorization: `OAuth ${accessToken}` } }
    );

    if (!streamsResponse.ok) {
      return res
        .status(streamsResponse.status)
        .json({ error: "Failed to get streams" });
    }

    const streams = await streamsResponse.json();
    const streamApiUrl = selectStreamUrl(streams);
    const streamUrl = await getActualStreamUrl(accessToken, streamApiUrl);

    res.setHeader("Cache-Control", "s-maxage=2700, stale-while-revalidate=300");

    return res.status(200).json({
      id: track.id,
      streamUrl,
      waveform: track.waveform_url,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: String(error) });
  }
}
