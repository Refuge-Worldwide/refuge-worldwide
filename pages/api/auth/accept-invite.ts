import type { NextApiRequest, NextApiResponse } from "next";
import { readUsers, updateUser } from "@directus/sdk";
import { directusUrl } from "@/lib/directus/session";
import { directusMembershipAdmin } from "@/lib/directus/admin";

// Directus's invite token is a signed (not encrypted) JWT containing the
// invited user's email — Directus's own accept endpoint already validated
// it by the time we read this, so we just need the payload, not to verify
// the signature ourselves.
function decodeInviteEmail(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );
    return typeof decoded.email === "string" ? decoded.email : null;
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, password, username } = req.body as {
    token?: string;
    password?: string;
    username?: string;
  };
  if (!token || !password || !username?.trim()) {
    return res
      .status(400)
      .json({ error: "Token, password and username are required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  const response = await fetch(`${directusUrl}/users/invite/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    return res
      .status(400)
      .json({ error: "That invite link is invalid or has expired" });
  }

  const email = decodeInviteEmail(token);
  if (!email) {
    console.warn(
      "[api/auth/accept-invite] could not decode email from invite token; username not set"
    );
    return res.status(200).json({ ok: true });
  }

  const users = await directusMembershipAdmin.request(
    readUsers({ filter: { email: { _eq: email } }, limit: 1, fields: ["id"] })
  );
  const user = users[0];
  if (!user) {
    console.warn(
      `[api/auth/accept-invite] accepted invite but found no user for ${email}; username not set`
    );
    return res.status(200).json({ ok: true });
  }

  await directusMembershipAdmin.request(
    updateUser(user.id, { first_name: username.trim() })
  );

  return res.status(200).json({ ok: true });
}
