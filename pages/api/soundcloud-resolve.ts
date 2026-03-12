import { NextApiRequest, NextApiResponse } from "next";
import {
  getAccessToken,
  resolve,
  getStreams,
  selectStreamUrl,
  getActualStreamUrl,
} from "../../lib/soundcloud";

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
    const track = await resolve(token, url);
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
    console.error("[soundcloud-resolve] Error:", error);
    return res.status(500).json({ error: String(error) });
  }
}
