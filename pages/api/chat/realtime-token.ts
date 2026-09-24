import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Hands out the Directus static token for the read-only "Chat Reader" user,
 * used solely to authenticate a websocket connection for live chat updates
 * (see lib/directus/chatRealtime.ts). That user carries only the existing
 * "Refuge App - Chat Read" policy — read access to the `chat` collection,
 * nothing else — so it's safe to serve to any caller, web or native app.
 *
 * Served from an API rather than baked into a client bundle so the token
 * can be rotated (update it in Directus, then here) without an app release.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.DIRECTUS_CHAT_REALTIME_TOKEN;
  if (!token) {
    console.error(
      "[api/chat/realtime-token] DIRECTUS_CHAT_REALTIME_TOKEN is not set"
    );
    return res.status(500).json({ error: "Realtime chat is not configured" });
  }

  // No caching — a rotated token should take effect on the next fetch, not
  // whenever some intermediate cache expires.
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ token });
}
