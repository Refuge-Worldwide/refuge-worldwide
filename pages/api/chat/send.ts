import type { NextApiRequest, NextApiResponse } from "next";
import { createItem } from "@directus/sdk";
import formidable, { errors as formidableErrors } from "formidable";
import fs from "fs";
import { directusServer } from "@/lib/directus/server";
import { getSessionUser } from "@/lib/directus/session";
import {
  checkAnonymousSurge,
  checkImageRateLimit,
  checkRateLimit,
  hashSenderIp,
  isBlockedUsername,
  moderateMessageText,
} from "@/lib/chatModeration";
import {
  MAX_CHAT_IMAGE_BYTES,
  chatImagesEnabled,
  deleteChatImage,
  readChatImage,
  uploadChatImage,
} from "@/lib/chatImages";

// Parsed by hand below so the same route can take a photo as multipart
export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_USERNAME_LENGTH = 30;
const MAX_MESSAGE_LENGTH = 500;
const MAX_JSON_BODY_BYTES = 10 * 1024;

// "Refuge Worldwide" is reserved for the automated show-announcement message
// (see is_system on the chat collection, which is what actually gates the
// frontend's system-message styling) — blocked here too, for any username
// containing "refuge" at all, so no one can even display a name that looks
// official, avoiding confusion even though it can no longer be used to spoof
// a system message.
function sanitizeUsername(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  // eslint-disable-next-line no-control-regex
  const cleaned = raw
    .trim()
    .replace(/[\x00-\x1f\x7f]/g, "")
    .slice(0, MAX_USERNAME_LENGTH);
  if (cleaned.length < 2) return null;
  if (cleaned.toLowerCase().includes("refuge")) return null;
  return cleaned;
}

function clientIp(req: NextApiRequest): string {
  const realIp = req.headers["x-real-ip"];
  return (
    (Array.isArray(realIp) ? realIp[0] : realIp) ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

class BadRequestError extends Error {}

interface SendBody {
  message: unknown;
  username: unknown;
  image: formidable.File | null;
}

async function readJsonBody(req: NextApiRequest): Promise<SendBody> {
  // decodes across chunk boundaries, so emoji don't get split
  req.setEncoding("utf8");
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_JSON_BODY_BYTES) {
      throw new BadRequestError("Message is too long");
    }
  }
  try {
    const body = JSON.parse(raw || "{}");
    return { message: body?.message, username: body?.username, image: null };
  } catch {
    throw new BadRequestError("Invalid request body");
  }
}

// Photos are only accepted here, as part of a message — there's no
// standalone upload route, so the chat's rate limits always apply.
async function readMultipartBody(req: NextApiRequest): Promise<SendBody> {
  const form = formidable({
    maxFiles: 1,
    maxFileSize: MAX_CHAT_IMAGE_BYTES,
    maxFields: 5,
    maxFieldsSize: MAX_JSON_BODY_BYTES,
    filter: ({ name, mimetype }) =>
      name === "image" && !!mimetype?.startsWith("image/"),
  });

  try {
    const [fields, files] = await form.parse(req);
    return {
      message: fields.message?.[0] ?? "",
      username: fields.username?.[0],
      image: files.image?.[0] ?? null,
    };
  } catch (error) {
    const code = (error as { code?: number })?.code;
    throw new BadRequestError(
      code === formidableErrors.maxFilesExceeded
        ? "You can only send one photo per message."
        : code === formidableErrors.biggerThanMaxFileSize
        ? "That photo is too large."
        : "Invalid upload"
    );
  }
}

function isForbidden(error: unknown): boolean {
  const errors = (error as { errors?: { extensions?: { code?: string } }[] })
    ?.errors;
  return errors?.some((e) => e.extensions?.code === "FORBIDDEN") ?? false;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body: SendBody;
  try {
    body = req.headers["content-type"]?.startsWith("multipart/form-data")
      ? await readMultipartBody(req)
      : await readJsonBody(req);
  } catch (error) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }

  const image = body.image;
  try {
    return await sendMessage(req, res, body);
  } finally {
    if (image) fs.promises.unlink(image.filepath).catch(() => {});
  }
}

async function sendMessage(
  req: NextApiRequest,
  res: NextApiResponse,
  { message: rawMessage, username: rawUsername, image }: SendBody
) {
  const message =
    typeof rawMessage === "string"
      ? rawMessage.trim().slice(0, MAX_MESSAGE_LENGTH)
      : "";
  if (!message && !image) {
    return res.status(400).json({ error: "Message is required" });
  }
  if (image && !chatImagesEnabled()) {
    return res
      .status(503)
      .json({ error: "Photo sharing isn't available right now." });
  }

  // Resolve identity server-side from the caller's own session cookie (or the
  // app's Bearer token) — never trust a client-supplied user id. No valid
  // session means anonymous.
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
    username = sanitizeUsername(rawUsername);
    userId = null;
    if (!username) {
      return res.status(400).json({ error: "A valid username is required" });
    }
    if (isBlockedUsername(username)) {
      return res
        .status(422)
        .json({ error: "That username isn't allowed — pick another one." });
    }
  }

  if (message) {
    const moderation = moderateMessageText(message);
    if (moderation.ok === false) {
      return res.status(422).json({ error: moderation.reason });
    }
  }

  const senderHash = userId ? null : hashSenderIp(clientIp(req));
  const identityKey = userId ?? (senderHash as string);
  const rateLimit = await checkRateLimit(
    identityKey,
    !!userId,
    message,
    username
  );
  if (rateLimit.ok === false) {
    return res.status(429).json({ error: rateLimit.reason });
  }

  if (senderHash) {
    const surge = await checkAnonymousSurge(senderHash);
    if (surge.ok === false) {
      return res.status(429).json({ error: surge.reason });
    }
  }

  let imageUrl: string | null = null;
  if (image) {
    const imageLimit = await checkImageRateLimit(identityKey, !!userId);
    if (imageLimit.ok === false) {
      return res.status(429).json({ error: imageLimit.reason });
    }

    const processed = await readChatImage(image.filepath);
    if (!processed) {
      return res
        .status(422)
        .json({ error: "Photos need to be a JPEG under 1MB." });
    }

    try {
      imageUrl = await uploadChatImage(processed);
    } catch (error) {
      console.error("[api/chat/send] failed to upload image:", error);
      return res.status(500).json({ error: "Failed to upload photo" });
    }
  }

  try {
    // Return the created row so the sender can show their own message
    // immediately, rather than waiting on the realtime event to round-trip
    // back through the websocket (see components/chatRoom.tsx).
    const created = await directusServer.request(
      createItem(
        "chat",
        {
          username,
          message,
          image: imageUrl,
          user: userId,
          sender_hash: senderHash,
        },
        {
          fields: [
            "id",
            "message",
            "username",
            "image",
            "date_created",
            "user",
            "is_system",
          ],
        }
      )
    );
    return res.status(200).json({ ok: true, message: created });
  } catch (error) {
    console.error("[api/chat/send] failed to write message:", error);
    // don't leave an orphaned photo behind
    await deleteChatImage(imageUrl).catch(() => {});
    // chat is switched off by removing the create permission in Directus
    if (isForbidden(error)) {
      return res.status(503).json({
        error: "The chatroom is closed until we're live again.",
      });
    }
    return res.status(500).json({ error: "Failed to send message" });
  }
}
