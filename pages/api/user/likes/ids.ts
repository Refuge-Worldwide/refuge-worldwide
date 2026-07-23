import type { NextApiRequest, NextApiResponse } from "next";
import { directusUrl, getValidAccessToken } from "@/lib/directus/session";

// Lightweight — just show IDs, no CMS hydration. Used by the like button on
// show cards, which only needs to know whether a given show is liked.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = await getValidAccessToken(req, res);
  if (!token) {
    return res.status(200).json({ ids: [] });
  }

  const response = await fetch(
    `${directusUrl}/items/show_favourites?fields=show_id&limit=-1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    return res.status(200).json({ ids: [] });
  }

  const { data } = await response.json();
  return res
    .status(200)
    .json({ ids: (data ?? []).map((d: { show_id: string }) => d.show_id) });
}
