import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";
import { readItems } from "@directus/sdk";
import { directusServer } from "@/lib/directus/server";

const profanityMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const RATE_LIMIT_WINDOW_MS = 5_000;
const RATE_LIMIT_MAX_MESSAGES = 3;

export type ModerationResult = { ok: true } | { ok: false; reason: string };

function normalize(text: string): string {
  // NFKC normalization + stripping zero-width/combining characters defeats
  // the common spacing/zero-width tricks used to sneak text past a naive
  // word-list check.
  return text.normalize("NFKC").replace(/[​-‍﻿̀-ͯ]/g, "");
}

function isSymbolHeavySpam(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length <= 4) return false; // allow short emoji reactions, e.g. "🔥🔥🔥"

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

  if (profanityMatcher.hasMatch(text)) {
    return { ok: false, reason: "That message isn't allowed here." };
  }

  return { ok: true };
}

/**
 * Best-effort rate limit + exact-repeat check, backed by the chat collection
 * itself rather than a separate store. `identityKey` is the resolved Directus
 * user id for signed-in senders, or the client-supplied username for
 * anonymous ones (anonymous identity is inherently spoofable — this is a
 * throttle, not a security boundary).
 */
export async function checkRateLimit(
  identityKey: string,
  isAuthenticated: boolean,
  newMessageText: string
): Promise<ModerationResult> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const recent = await directusServer.request(
    readItems("chat", {
      filter: {
        _and: [
          isAuthenticated
            ? { user: { _eq: identityKey } }
            : { username: { _eq: identityKey } },
          { date_created: { _gte: since } },
        ],
      },
      sort: ["-date_created"],
      limit: RATE_LIMIT_MAX_MESSAGES + 1,
      fields: ["message"],
    })
  );

  if (recent.length >= RATE_LIMIT_MAX_MESSAGES) {
    return {
      ok: false,
      reason: "You're sending messages too fast — slow down a little.",
    };
  }

  if (recent[0]?.message === newMessageText) {
    return { ok: false, reason: "You just sent that message." };
  }

  return { ok: true };
}
