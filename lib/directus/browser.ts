import { createDirectus, realtime, rest } from "@directus/sdk";

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

if (!directusUrl) {
  throw new Error("NEXT_PUBLIC_DIRECTUS_URL is not set");
}

// Unauthenticated client for the browser — only used to read the public
// `chat` feed and subscribe to new messages. Writing always goes through
// /api/chat/send so messages are moderated server-side.
export const directusBrowser = createDirectus(directusUrl)
  .with(rest())
  .with(realtime({ authMode: "public" }));
