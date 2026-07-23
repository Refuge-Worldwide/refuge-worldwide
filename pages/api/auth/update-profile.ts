import type { NextApiRequest, NextApiResponse } from "next";
import { directusUrl, getValidAccessToken } from "@/lib/directus/session";

// The "username" the UI shows is stored in Directus's built-in first_name field — there's no native username field!
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.body as { username?: string };
  if (!username || username.trim().length < 2) {
    return res
      .status(400)
      .json({ error: "Username must be at least 2 characters" });
  }

  const token = await getValidAccessToken(req, res);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const response = await fetch(`${directusUrl}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ first_name: username.trim() }),
  });

  if (!response.ok) {
    return res.status(400).json({ error: "Failed to update profile" });
  }

  return res.status(200).json({ ok: true });
}
