import type { NextApiRequest, NextApiResponse } from "next";
import { directusUrl } from "@/lib/directus/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  const response = await fetch(`${directusUrl}/auth/password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    return res
      .status(400)
      .json({ error: "That reset link is invalid or has expired" });
  }

  return res.status(200).json({ ok: true });
}
