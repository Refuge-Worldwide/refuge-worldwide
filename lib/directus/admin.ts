import { createDirectus, rest, staticToken } from "@directus/sdk";

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const adminToken = process.env.DIRECTUS_ADMIN_TOKEN;

if (!directusUrl) {
  throw new Error("NEXT_PUBLIC_DIRECTUS_URL is not set");
}

if (!adminToken) {
  throw new Error("DIRECTUS_ADMIN_TOKEN is not set");
}

// Server-only, admin-privileged client used exclusively by the Stripe
// webhook to create/invite users and write their supporter/subscription fields.
// Never import this file from client-side code, and never reuse this token for anything else.
export const directusMembershipAdmin = createDirectus(directusUrl)
  .with(staticToken(adminToken))
  .with(rest());
