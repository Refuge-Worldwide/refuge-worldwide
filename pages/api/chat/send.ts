import type { NextApiRequest, NextApiResponse } from "next";
import { createItem } from "@directus/sdk";
import { directusServer, resolveDirectusUser } from "@/lib/directus/server";
import { checkRateLimit, moderateMessageText } from "@/lib/chatModeration";

const MAX_USERNAME_LENGTH = 30;
const MAX_MESSAGE_LENGTH = 500;

function sanitizeUsername(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  // eslint-disable-next-line no-control-regex
  const cleaned = raw
    .trim()
    .replace(/[\x00-\x1f\x7f]/g, "")
    .slice(0, MAX_USERNAME_LENGTH);
  return cleaned.length >= 2 ? cleaned : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawMessage = req.body?.message;
  if (typeof rawMessage !== "string" || rawMessage.trim().length === 0) {
    return res.status(400).json({ error: "Message is required" });
  }
  const message = rawMessage.trim().slice(0, MAX_MESSAGE_LENGTH);

  // Resolve identity server-side from the caller's own Directus token —
  // never trust a client-supplied user id. No header means anonymous.
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  const resolvedUser = token ? await resolveDirectusUser(token) : null;

  let username: string | null;
  let userId: string | null;

  if (resolvedUser) {
    // Signed-in sender: username is derived from the verified identity, never
    // from the request body — otherwise a logged-in user could impersonate
    // someone else's display name.
    username = resolvedUser.email.split("@")[0];
    userId = resolvedUser.id;
  } else {
    username = sanitizeUsername(req.body?.username);
    userId = null;
    if (!username) {
      return res.status(400).json({ error: "A valid username is required" });
    }
  }

  const moderation = moderateMessageText(message);
  if (moderation.ok === false) {
    return res.status(422).json({ error: moderation.reason });
  }

  const identityKey = userId ?? username;
  const rateLimit = await checkRateLimit(identityKey, !!userId, message);
  if (rateLimit.ok === false) {
    return res.status(429).json({ error: rateLimit.reason });
  }

  try {
    await directusServer.request(
      createItem("chat", {
        username,
        message,
        user: userId,
      })
    );
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[api/chat/send] failed to write message:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
}
