import type { NextApiRequest, NextApiResponse } from "next";
import { clearSessionCookies, logoutSession } from "@/lib/directus/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await logoutSession(req);
  } catch (error) {
    console.error("[api/auth/logout] Directus logout failed:", error);
  }

  clearSessionCookies(res);
  return res.status(200).json({ ok: true });
}
