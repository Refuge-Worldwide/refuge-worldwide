import { readUsers } from "@directus/sdk";
import { directusMembershipAdmin } from "@/lib/directus/admin";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_SIGNUPS = 3;

export type RateLimitResult = { ok: true } | { ok: false; reason: string };

/**
 * Best-effort per-IP throttle on account creation, backed by directus_users
 * itself (same approach as lib/chatModeration.ts's per-identity limiter) —
 * relies on the signup_ip field written on each created account. Not a hard
 * security boundary (IPs are shared/spoofable), just enough to blunt casual
 * scripted abuse of a public signup endpoint.
 */
export async function checkSignupRateLimit(
  ip: string | null
): Promise<RateLimitResult> {
  if (!ip) return { ok: true }; // can't identify the caller — fail open rather than block real signups

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const recent = await directusMembershipAdmin.request(
    readUsers({
      filter: {
        signup_ip: { _eq: ip },
        date_created: { _gte: since },
      },
      limit: RATE_LIMIT_MAX_SIGNUPS + 1,
      fields: ["id"],
    } as unknown as Record<string, unknown>)
  );

  if (recent.length >= RATE_LIMIT_MAX_SIGNUPS) {
    return {
      ok: false,
      reason: "Too many accounts created recently — please try again later.",
    };
  }

  return { ok: true };
}

/** Best-effort client IP from standard proxy headers, or the raw socket as a fallback. */
export function getClientIp(req: {
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket?.remoteAddress ?? null;
}
