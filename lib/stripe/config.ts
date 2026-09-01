import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? "",
  {
    appInfo: {
      name: "Refuge Worldwide",
      version: "1.0.0",
    },
  }
);
