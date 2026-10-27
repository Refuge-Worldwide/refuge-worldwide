import type { NextApiRequest, NextApiResponse } from "next";
import { normalizeEmail } from "@/lib/normalizeEmail";
import { loginWithPassword } from "@/lib/directus/session";

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

  if (!(await loginWithPassword(email, password, res))) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  return res.status(200).json({ ok: true });
}
