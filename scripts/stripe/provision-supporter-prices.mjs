// Idempotent provisioning script for the supporter membership Product/Prices.
// Safe to re-run — looks up existing objects by lookup_key before creating.
//
// Usage: node --env-file=.env scripts/stripe/provision-supporter-prices.mjs
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCT_NAME = "Refuge Worldwide Supporter";
const AMOUNTS_EUR = [5, 7.5, 15, 30, 50, 100];
const INTERVALS = ["month", "year"];

function lookupKeyFor(amountEur, interval) {
  // e.g. supporter_7_50_month — keep it stable and human-readable
  const amountKey = String(amountEur).replace(".", "_");
  return `supporter_${amountKey}_${interval}`;
}

async function ensureProduct() {
  // products.list + client-side filter rather than products.search, since
  // the search index has an eventual-consistency delay that could cause a
  // duplicate product if this script is re-run shortly after creation.
  const existing = await stripe.products.list({ active: true, limit: 100 });
  const found = existing.data.find((p) => p.name === PRODUCT_NAME);
  if (found) {
    console.log(`Using existing product ${found.id}`);
    return found;
  }

  const product = await stripe.products.create({ name: PRODUCT_NAME });
  console.log(`Created product ${product.id}`);
  return product;
}

// Annual price = 10x the monthly amount (2 months free), not 12x.
function amountForInterval(monthlyAmountEur, interval) {
  return interval === "year" ? monthlyAmountEur * 10 : monthlyAmountEur;
}

async function ensurePrice(productId, monthlyAmountEur, interval) {
  const lookup_key = lookupKeyFor(monthlyAmountEur, interval);
  const chargeAmountEur = amountForInterval(monthlyAmountEur, interval);
  const expectedUnitAmount = Math.round(chargeAmountEur * 100);

  const existing = await stripe.prices.list({
    lookup_keys: [lookup_key],
    limit: 1,
  });
  if (existing.data[0]) {
    if (existing.data[0].unit_amount !== expectedUnitAmount) {
      // Prices are immutable in Stripe — archive the stale one and free up
      // the lookup_key so a corrected price can take it.
      console.log(
        `  ${lookup_key} -> ${existing.data[0].id} has wrong amount (${existing.data[0].unit_amount}), archiving...`
      );
      await stripe.prices.update(existing.data[0].id, {
        active: false,
        lookup_key: null,
      });
    } else {
      console.log(`  ${lookup_key} -> ${existing.data[0].id} (already exists)`);
      return existing.data[0];
    }
  }

  const price = await stripe.prices.create({
    product: productId,
    currency: "eur",
    unit_amount: expectedUnitAmount,
    recurring: { interval },
    lookup_key,
    nickname: `€${chargeAmountEur}/${interval}`,
  });
  console.log(
    `  ${lookup_key} -> ${price.id} (created, €${chargeAmountEur}/${interval})`
  );
  return price;
}

const product = await ensureProduct();

for (const amount of AMOUNTS_EUR) {
  for (const interval of INTERVALS) {
    await ensurePrice(product.id, amount, interval);
  }
}

console.log(
  "\nDone. The app resolves prices at request time via lookup_key, so no IDs need to be copied into env vars."
);
