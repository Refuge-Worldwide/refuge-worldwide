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

  const { password } = req.body as { password?: string };
  if (!password || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  const token = await getValidAccessToken(req, res);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Reset password for logged in users, doesn't required email flow.
  const response = await fetch(`${directusUrl}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    return res.status(400).json({ error: "Failed to update password" });
  }

  return res.status(200).json({ ok: true });
}
