import { useMemo, useState } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/client";

const AMOUNTS_EUR = [5, 7.5, 15, 30, 50, 100];

function formatEur(amount: number): string {
  return amount % 1 === 0 ? `${amount}` : amount.toFixed(2);
}

export function SupportPicker({
  clientSecret: controlledClientSecret,
  onClientSecretChange,
  email,
  fromApp,
}: {
  // Both optional — omit entirely for the uncontrolled, standalone usage
  // (account page). SupportModal passes both to lift this up so it can
  // render its own back button once checkout starts.
  clientSecret?: string | null;
  onClientSecretChange?: (value: string | null) => void;
  // Known email of a signed-in app user starting checkout here — prefills
  // and locks Stripe's email field so the payment attaches to their
  // existing account instead of risking a typo'd/different address. See
  // pages/api/stripe/create-checkout-session.ts.
  email?: string;
  // Whether this checkout was opened from the mobile app — tells the
  // success page to redirect back into the app instead of showing the
  // website's normal "sign in" messaging.
  fromApp?: boolean;
} = {}) {
  const [amountIndex, setAmountIndex] = useState(0); // default to lowest amount, €5
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month"
  );
  const [internalClientSecret, setInternalClientSecret] = useState<
    string | null
  >(null);
  const isControlled = controlledClientSecret !== undefined;
  const clientSecret = isControlled
    ? controlledClientSecret
    : internalClientSecret;
  function setClientSecret(value: string | null) {
    onClientSecretChange?.(value);
    if (!isControlled) setInternalClientSecret(value);
  }
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const monthlyAmount = AMOUNTS_EUR[amountIndex];
  const chargeAmount =
    billingInterval === "year" ? monthlyAmount * 10 : monthlyAmount;

  const options = useMemo(
    () => (clientSecret ? { clientSecret } : null),
    [clientSecret]
  );

  async function handleContinue() {
    setIsLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountEur: monthlyAmount,
          interval: billingInterval,
          email,
          fromApp,
        }),
      });
      const data = await res.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setApiError(data.error || "Failed to start checkout");
      }
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {!clientSecret && (
        <div className="max-w-2xl mx-auto border-2 border-black p-8 space-y-8">
          {/* Interval toggle */}
          <div className="flex justify-center">
            <div className="inline-flex border border-black rounded-full p-1">
              <button
                type="button"
                onClick={() => setBillingInterval("month")}
                className={`px-5 py-2 rounded-full text-small font-medium transition-colors ${
                  billingInterval === "month"
                    ? "bg-black text-white"
                    : "hover:opacity-60"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval("year")}
                className={`px-5 py-2 rounded-full text-small font-medium transition-colors ${
                  billingInterval === "year"
                    ? "bg-black text-white"
                    : "hover:opacity-60"
                }`}
              >
                Annual
                <span className="ml-1 opacity-60">(2 months free)</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center space-y-4">
            <p className="font-sans text-xlarge">
              €{formatEur(chargeAmount)}
              <span className="text-small font-normal opacity-60">
                {" "}
                /{billingInterval}
              </span>
            </p>

            <input
              type="range"
              min={0}
              max={AMOUNTS_EUR.length - 1}
              step={1}
              value={amountIndex}
              onChange={(e) => setAmountIndex(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
              aria-label="Support amount"
            />
          </div>

          {apiError && (
            <p className="text-small text-red text-center">{apiError}</p>
          )}

          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full bg-black text-white rounded-full py-4 px-6 text-small font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
          >
            {isLoading
              ? "Loading..."
              : `Continue — €${formatEur(chargeAmount)}/${billingInterval}`}
          </button>

          <p className="text-center text-tiny opacity-40">
            Payments are processed securely by Stripe. Cancel anytime.
          </p>
        </div>
      )}

      {options && (
        <div className="max-w-2xl mx-auto mt-0">
          <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}
    </>
  );
}
