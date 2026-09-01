import type { NextApiRequest, NextApiResponse } from "next";
import { createItem } from "@directus/sdk";
import { directusServer } from "@/lib/directus/server";
import { getSessionUser } from "@/lib/directus/session";
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

  // Resolve identity server-side from the caller's own session cookie —
  // never trust a client-supplied user id. No valid session means anonymous.
  const sessionUser = await getSessionUser(req, res, "id,email,first_name");

  let username: string | null;
  let userId: string | null;

  if (sessionUser) {
    // Signed-in sender: same display name as their account (Account
    // Settings' "Username" field, which is Directus's first_name — see
    // pages/api/auth/update-profile.ts), derived from the verified session,
    // never from the request body — otherwise a logged-in user could
    // impersonate someone else's display name.
    username =
      (sessionUser.first_name as string | undefined)?.trim() ||
      (sessionUser.email as string).split("@")[0];
    userId = sessionUser.id as string;
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
    // Return the created row so the sender can show their own message
    // immediately, rather than waiting on the realtime event to round-trip
    // back through the websocket (see components/chatRoom.tsx).
    const created = await directusServer.request(
      createItem("chat", {
        username,
        message,
        user: userId,
      })
    );
    return res.status(200).json({ ok: true, message: created });
  } catch (error) {
    console.error("[api/chat/send] failed to write message:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
}
