import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";
import { createHmac } from "crypto";
import { readItems } from "@directus/sdk";
import { directusServer } from "@/lib/directus/server";

const profanityMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const RATE_LIMIT_WINDOW_MS = 5_000;
const RATE_LIMIT_MAX_MESSAGES = 3;
const IMAGE_RATE_LIMIT_WINDOW_MS = 30_000;

const ANON_IP_WINDOW_MS = 10 * 60_000;
const ANON_IP_MAX_MESSAGES = 20;

const ANON_SURGE_WINDOW_MS = 60_000;
const ANON_SURGE_MAX_MESSAGES = 30;
const ESTABLISHED_SENDER_AGE_MS = 10 * 60_000;

function ipKey(ip: string): string {
  const addr = ip.split("%")[0];
  if (!addr.includes(":") || addr.includes(".")) {
    return addr.slice(addr.lastIndexOf(":") + 1);
  }
  const [head, tail] = addr.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail ? tail.split(":") : [];
  const groups = [
    ...headParts,
    ...Array(Math.max(0, 8 - headParts.length - tailParts.length)).fill("0"),
    ...tailParts,
  ];
  return groups
    .slice(0, 4)
    .map((group) => parseInt(group || "0", 16).toString(16))
    .join(":");
}

export function hashSenderIp(ip: string): string {
  return createHmac("sha256", process.env.DIRECTUS_CHAT_SERVICE_TOKEN as string)
    .update(ipKey(ip))
    .digest("hex")
    .slice(0, 32);
}

function senderFilter(identityKey: string, isAuthenticated: boolean) {
  return isAuthenticated
    ? { user: { _eq: identityKey } }
    : { sender_hash: { _eq: identityKey } };
}

function isoAgo(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

export type ModerationResult = { ok: true } | { ok: false; reason: string };

function normalize(text: string): string {
  // NFKC normalization + stripping zero-width/combining characters defeats
  // the common spacing/zero-width tricks used to sneak text past a naive
  // word-list check.
  return text.normalize("NFKC").replace(/[​-‍﻿̀-ͯ]/g, "");
}

// catches "f u c k" / "f-u-c-k" style spacing without touching real words
const SPELLED_OUT_LETTER = "(?<![\\p{L}])\\p{L}(?![\\p{L}])";
const SPELLED_OUT_WORD = new RegExp(
  `${SPELLED_OUT_LETTER}(?:[\\s\\-_.]+${SPELLED_OUT_LETTER})+`,
  "gu"
);

function collapseSpelledOutWords(text: string): string {
  return text.replace(SPELLED_OUT_WORD, (spelledOut) =>
    spelledOut.replace(/[\s\-_.]+/g, "")
  );
}

function isSymbolHeavySpam(text: string): boolean {
  const trimmed = text.trim();
  // code points, not .length — emoji are surrogate pairs
  if ([...trimmed].length <= 4) return false; // allow short emoji reactions, e.g. "🔥🔥🔥"

  const letterOrDigitCount = (trimmed.match(/[\p{L}\p{N}]/gu) ?? []).length;
  return letterOrDigitCount === 0;
}

export function moderateMessageText(rawText: string): ModerationResult {
  const text = normalize(rawText);

  if (isSymbolHeavySpam(text)) {
    return {
      ok: false,
      reason:
        "That message looks like it's just symbols/emoji with no text — please include an actual message.",
    };
  }

  if (
    profanityMatcher.hasMatch(text) ||
    profanityMatcher.hasMatch(collapseSpelledOutWords(text))
  ) {
    return { ok: false, reason: "That message isn't allowed here." };
  }

  return { ok: true };
}

/**
 * Best-effort rate limit + exact-repeat check, backed by the chat collection
 * itself rather than a separate store. `identityKey` is the resolved Directus
 * user id for signed-in senders, or the hashed IP (see hashSenderIp) for
 * anonymous ones.
 */
export async function checkRateLimit(
  identityKey: string,
  isAuthenticated: boolean,
  newMessageText: string
): Promise<ModerationResult> {
  const windowMs = isAuthenticated ? RATE_LIMIT_WINDOW_MS : ANON_IP_WINDOW_MS;
  const maxRows = isAuthenticated
    ? RATE_LIMIT_MAX_MESSAGES
    : ANON_IP_MAX_MESSAGES;

  const recent = await directusServer.request(
    readItems("chat", {
      filter: {
        _and: [
          senderFilter(identityKey, isAuthenticated),
          { date_created: { _gte: isoAgo(windowMs) } },
        ],
      },
      sort: ["-date_created"],
      limit: maxRows,
      fields: ["message", "date_created"],
    })
  );

  const burstStart = Date.now() - RATE_LIMIT_WINDOW_MS;
  const inBurst = recent.filter(
    (row) => Date.parse(row.date_created as string) >= burstStart
  );

  if (inBurst.length >= RATE_LIMIT_MAX_MESSAGES) {
    return {
      ok: false,
      reason: "You're sending messages too fast — slow down a little.",
    };
  }

  if (!isAuthenticated && recent.length >= ANON_IP_MAX_MESSAGES) {
    return {
      ok: false,
      reason:
        "You've sent a lot of messages in the last few minutes — take a short break, or sign in to keep chatting.",
    };
  }

  // photo-only messages have no text, so there's nothing to compare
  if (newMessageText && inBurst[0]?.message === newMessageText) {
    return { ok: false, reason: "You just sent that message." };
  }

  return { ok: true };
}

export async function checkAnonymousSurge(
  senderHash: string
): Promise<ModerationResult> {
  const recentAnonymous = await directusServer.request(
    readItems("chat", {
      filter: {
        _and: [
          { sender_hash: { _nnull: true } },
          { date_created: { _gte: isoAgo(ANON_SURGE_WINDOW_MS) } },
        ],
      },
      limit: ANON_SURGE_MAX_MESSAGES,
      fields: ["id"],
    })
  );

  if (recentAnonymous.length < ANON_SURGE_MAX_MESSAGES) return { ok: true };

  const earlierMessage = await directusServer.request(
    readItems("chat", {
      filter: {
        _and: [
          { sender_hash: { _eq: senderHash } },
          { date_created: { _lt: isoAgo(ESTABLISHED_SENDER_AGE_MS) } },
        ],
      },
      limit: 1,
      fields: ["id"],
    })
  );

  if (earlierMessage.length > 0) return { ok: true };

  return {
    ok: false,
    reason:
      "The chat is really busy right now — sign in to keep chatting, or try again in a minute.",
  };
}

/** One photo per sender every 30 seconds, on top of checkRateLimit. */
export async function checkImageRateLimit(
  identityKey: string,
  isAuthenticated: boolean
): Promise<ModerationResult> {
  const recent = await directusServer.request(
    readItems("chat", {
      filter: {
        _and: [
          senderFilter(identityKey, isAuthenticated),
          { image: { _nnull: true } },
          { date_created: { _gte: isoAgo(IMAGE_RATE_LIMIT_WINDOW_MS) } },
        ],
      },
      limit: 1,
      fields: ["id"],
    })
  );

  if (recent.length > 0) {
    return {
      ok: false,
      reason: "You can only send one photo every 30 seconds.",
    };
  }

  return { ok: true };
}
