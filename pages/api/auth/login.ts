import type { NextApiRequest, NextApiResponse } from "next";
import { normalizeEmail } from "@/lib/normalizeEmail";
import { directusUrl, setSessionCookies } from "@/lib/directus/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email: rawEmail, password } = req.body as {
    email?: string;
    password?: string;
  };
  if (!rawEmail?.trim() || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const email = normalizeEmail(rawEmail);

  const response = await fetch(`${directusUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, mode: "json" }),
  });

  if (!response.ok) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const { data } = await response.json();
  setSessionCookies(res, data);
  return res.status(200).json({ ok: true });
}
