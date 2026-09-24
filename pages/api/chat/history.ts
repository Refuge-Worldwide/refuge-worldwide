import type { NextApiRequest, NextApiResponse } from "next";

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

/**
 * Thin same-origin relay for reading `chat` — Directus's CORS config only
 * allows the production origin, so the browser can't call its REST endpoint
 * directly from localhost, preview deploys, or the app's webview. This just
 * forwards the query string server-side, where CORS doesn't apply, and
 * passes Directus's response straight through.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    for (const v of Array.isArray(value) ? value : [value]) {
      if (v !== undefined) qs.append(key, v);
    }
  }

  const directusRes = await fetch(`${directusUrl}/items/chat?${qs}`);
  const data = await directusRes.json();
  return res.status(directusRes.status).json(data);
}
