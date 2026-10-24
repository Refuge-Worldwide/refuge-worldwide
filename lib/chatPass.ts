import { createHmac, timingSafeEqual } from "crypto";
import { readItems } from "@directus/sdk";
import { directusServer } from "@/lib/directus/server";

// An anonymous sender gets a pass after passing Turnstile. It's tied to
// their IP and runs out after 30 minutes or 15 messages, whichever is first.
const PASS_LIFETIME_MS = 30 * 60_000;
const PASS_MAX_MESSAGES = 15;

function sign(senderHash: string, issuedAt: number): string {
  return createHmac("sha256", process.env.DIRECTUS_CHAT_SERVICE_TOKEN as string)
    .update(`chat-pass:${senderHash}:${issuedAt}`)
    .digest("base64url");
}

export function issueChatPass(senderHash: string): string {
  const issuedAt = Date.now();
  return `${issuedAt}.${sign(senderHash, issuedAt)}`;
}

export async function isChatPassValid(
  pass: string | undefined,
  senderHash: string
): Promise<boolean> {
  if (!pass) return false;
  const [issuedAtRaw, signature] = pass.split(".");
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt) || !signature) return false;
  if (Date.now() - issuedAt > PASS_LIFETIME_MS) return false;

  const expected = new TextEncoder().encode(sign(senderHash, issuedAt));
  const given = new TextEncoder().encode(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return false;
  }

  const sent = await directusServer.request(
    readItems("chat", {
      filter: {
        _and: [
          { sender_hash: { _eq: senderHash } },
          { date_created: { _gte: new Date(issuedAt).toISOString() } },
        ],
      },
      limit: PASS_MAX_MESSAGES,
      fields: ["id"],
    })
  );
  return sent.length < PASS_MAX_MESSAGES;
}

export async function verifyTurnstileToken(
  token: string,
  ip: string
): Promise<boolean> {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    }
  );
  const result = await response.json().catch(() => null);
  return result?.success === true;
}
