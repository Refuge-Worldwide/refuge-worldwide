import createMollieClient from "@mollie/api-client";

if (!process.env.MOLLIE_API_KEY) {
  console.warn("MOLLIE_API_KEY is not set");
}

export const mollie = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY || "",
});

export type PlanId = "supporter_monthly" | "supporter_annual" | "member_annual";

export const PLANS: Record<
  PlanId,
  { amount: string; interval: string; description: string; tier: string }
> = {
  supporter_monthly: {
    amount: "3.00",
    interval: "1 month",
    description: "Refuge Worldwide Supporter - Monthly",
    tier: "supporter",
  },
  supporter_annual: {
    amount: "30.00",
    interval: "1 year",
    description: "Refuge Worldwide Supporter - Annual",
    tier: "supporter",
  },
  member_annual: {
    amount: "50.00",
    interval: "1 year",
    description: "Refuge Worldwide Member - Annual",
    tier: "member",
  },
};
