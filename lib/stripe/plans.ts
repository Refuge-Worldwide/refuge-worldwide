export type PlanId = "supporter_monthly" | "supporter_annual" | "member_annual";

export const PLANS: Record<
  PlanId,
  {
    label: string;
    minAmount: number; // in cents
    interval: "month" | "year";
    productEnvKey: string;
    presets: number[]; // suggested amounts in euros
  }
> = {
  supporter_monthly: {
    label: "Supporter – Monthly",
    minAmount: 300,
    interval: "month",
    productEnvKey: "STRIPE_PRODUCT_SUPPORTER",
    presets: [3, 5, 10],
  },
  supporter_annual: {
    label: "Supporter – Annual",
    minAmount: 3000,
    interval: "year",
    productEnvKey: "STRIPE_PRODUCT_SUPPORTER",
    presets: [30, 50, 100],
  },
  member_annual: {
    label: "Member – Annual",
    minAmount: 5000,
    interval: "year",
    productEnvKey: "STRIPE_PRODUCT_MEMBER",
    presets: [50, 75, 100],
  },
};
