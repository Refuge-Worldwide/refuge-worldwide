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

  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  ).replace(/\/$/, "");

  // Always respond success regardless of whether the email exists.
  await fetch(`${directusUrl}/auth/password/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, reset_url: `${baseUrl}/reset-password` }),
  }).catch((error) => {
    console.error("[api/auth/forgot-password] request failed:", error);
  });

  return res.status(200).json({ ok: true });
}
