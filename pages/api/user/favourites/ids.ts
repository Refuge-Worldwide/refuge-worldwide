import type { NextApiRequest, NextApiResponse } from "next";
import { directusUrl, getValidAccessToken } from "@/lib/directus/session";
import { getUserAccess, getUserIdFromToken } from "@/lib/directus/staff";

// Lightweight — just show IDs, no CMS hydration. Used by the favourite
// button on show cards, which only needs to know whether a given show is
// favourited.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // not a supporter? just show no favourites rather than 403 here
  const token = await getValidAccessToken(req, res);
  if (!token) {
    return res.status(200).json({ ids: [] });
  }
  const userId = await getUserIdFromToken(token);
  if (!userId || !(await getUserAccess(userId)).hasSupporterAccess) {
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
