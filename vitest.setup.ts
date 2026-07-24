import { vi } from "vitest";

// Fake values so modules that throw on a missing env var can load — never
// real credentials, and nothing in these tests makes a real network call.
process.env.NEXT_PUBLIC_DIRECTUS_URL = "https://directus.test";
process.env.DIRECTUS_ADMIN_TOKEN = "test-admin-token";
process.env.DIRECTUS_CHAT_SERVICE_TOKEN = "test-chat-service-token";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_dummy";
process.env.NEXT_PUBLIC_SITE_URL = "https://refugeworldwide.test";

// Mute expected log/warn/error noise from the code under test.
global.console.log = vi.fn();
global.console.warn = vi.fn();
global.console.error = vi.fn();
