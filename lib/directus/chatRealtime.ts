import { createDirectus, realtime, staticToken } from "@directus/sdk";

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

if (!directusUrl) {
  throw new Error("NEXT_PUBLIC_DIRECTUS_URL is not set");
}

let tokenPromise: Promise<string> | null = null;

/**
 * Fetches the read-only realtime token from our own API rather than baking
 * it into the client bundle, so it can be rotated (in Directus + the
 * DIRECTUS_CHAT_REALTIME_TOKEN env var) without shipping an app update —
 * see pages/api/chat/realtime-token.ts. Cached per page load; cleared on
 * failure so a later call can retry.
 */
async function fetchRealtimeToken(): Promise<string> {
  if (!tokenPromise) {
    tokenPromise = fetch("/api/chat/realtime-token")
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch realtime token (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (typeof data?.token !== "string") {
          throw new Error("Realtime token response missing token");
        }
        return data.token as string;
      })
      .catch((error) => {
        tokenPromise = null;
        throw error;
      });
  }
  return tokenPromise;
}

/**
 * Builds a fresh websocket-capable Directus client authenticated as the
 * read-only "Chat Reader" Directus user. That user carries only the
 * existing "Refuge App - Chat Read" policy — read access to the `chat`
 * collection, nothing else — so its token is safe to hand to any client,
 * web or app. It exists purely because this Directus instance's websocket
 * layer (WEBSOCKETS_REST_AUTH, default "handshake") requires every socket
 * to authenticate; there's no fully anonymous realtime mode enabled here.
 *
 * Callers own the returned client's lifecycle (subscribe/disconnect).
 */
export async function createChatRealtimeClient() {
  const token = await fetchRealtimeToken();
  return createDirectus(directusUrl as string)
    .with(realtime({ authMode: "handshake" }))
    .with(staticToken(token));
}
