import type { NextApiRequest, NextApiResponse } from "next";
import { clearSessionCookies, directusUrl } from "@/lib/directus/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const refreshToken = req.cookies["directus_refresh_token"];

  if (refreshToken) {
    try {
      await fetch(`${directusUrl}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "json", refresh_token: refreshToken }),
      });
    } catch (error) {
      console.error("[api/auth/logout] Directus logout failed:", error);
    }
  }

  clearSessionCookies(res);
  return res.status(200).json({ ok: true });
}
