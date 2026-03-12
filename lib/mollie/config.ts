import createMollieClient from "@mollie/api-client";

if (!process.env.MOLLIE_API_KEY) {
  console.warn("MOLLIE_API_KEY is not set");
}

export const mollie = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY || "",
});
