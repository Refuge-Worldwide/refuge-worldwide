import type { NextApiRequest, NextApiResponse } from "next";
import { directusUrl, getValidAccessToken } from "@/lib/directus/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { showId } = req.body as { showId?: string };
  if (!showId) {
    return res.status(400).json({ error: "showId is required" });
  }

  const token = await getValidAccessToken(req, res);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const existingRes = await fetch(
      `${directusUrl}/items/show_favourites?filter[show_id][_eq]=${encodeURIComponent(
        showId
      )}&limit=1&fields=id`,
      { headers }
    );
    if (!existingRes.ok) throw new Error("Failed to check existing favourite");
    const { data: existing } = await existingRes.json();

    if (existing?.[0]) {
      const deleteRes = await fetch(
        `${directusUrl}/items/show_favourites/${existing[0].id}`,
        {
          method: "DELETE",
          headers,
        }
      );
      if (!deleteRes.ok) throw new Error("Failed to remove favourite");
      return res.status(200).json({ liked: false });
    }

    const createRes = await fetch(`${directusUrl}/items/show_favourites`, {
      method: "POST",
      headers,
      body: JSON.stringify({ show_id: showId }),
    });
    if (!createRes.ok) throw new Error("Failed to add favourite");
    return res.status(200).json({ liked: true });
  } catch (error) {
    console.error("[api/user/likes/toggle] failed:", error);
    return res.status(500).json({ error: "Failed to update favourite" });
  }
}
