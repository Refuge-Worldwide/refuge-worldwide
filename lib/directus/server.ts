import { createDirectus, rest, staticToken } from "@directus/sdk";

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const chatServiceToken = process.env.DIRECTUS_CHAT_SERVICE_TOKEN;

if (!directusUrl) {
  throw new Error("NEXT_PUBLIC_DIRECTUS_URL is not set");
}

if (!chatServiceToken) {
  throw new Error("DIRECTUS_CHAT_SERVICE_TOKEN is not set");
}

// Server-only client, authenticated as the dedicated "Chat Service" Directus
// user. This is the only identity allowed to write to the `chat` collection —
// see refugeWorldwideApp/scripts/directus-schema for the permission setup.
// Never import this file from client-side code.
export const directusServer = createDirectus(directusUrl)
  .with(staticToken(chatServiceToken))
  .with(rest());
