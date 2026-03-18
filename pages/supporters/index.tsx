import type { GetServerSidePropsContext } from "next";
import { createClient } from "@/lib/supabase/server-props";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import Link from "next/link";
import { useState, FormEvent } from "react";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/client";
import { PLANS, type PlanId } from "@/lib/stripe/plans";

type SupportersPageProps = {
  user: { id: string; email: string } | null;
  hasActiveSubscription: boolean;
};

// ─── Payment form (rendered inside <Elements>) ───────────────────────────────

const cardStyle = {
  style: {
    base: {
      fontFamily: "inherit",
      fontSize: "14px",
      color: "#000000",
      "::placeholder": { color: "rgba(0,0,0,0.35)" },
    },
    invalid: { color: "#ef4444" },
  },
};

function CardField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-small font-medium mb-2">{label}</label>
      <div className="border border-black/30 rounded-full px-4 py-3 focus-within:border-black transition-colors">
        {children}
      </div>
    </div>
  );
}

function PaymentForm({
  planLabel,
  interval,
  amount,
  clientSecret,
  isGuest,
  onBack,
}: {
  planLabel: string;
  interval: "month" | "year";
  amount: number;
  clientSecret: string;
  isGuest: boolean;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (isGuest && !email) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) return;

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: isGuest ? { email } : undefined,
      },
    });

    if (error) {
      setErrorMessage(error.message ?? "Something went wrong.");
      setIsSubmitting(false);
    } else {
      window.location.href = `${window.location.origin}/supporters/success`;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-baseline justify-between pb-4 border-b border-black/10">
        <p className="font-medium">{planLabel}</p>
        <p className="font-serif text-medium">
          €{amount.toFixed(2)}
          <span className="text-small font-normal opacity-60">
            {" "}
            /{interval}
          </span>
        </p>
      </div>

      {isGuest && (
        <div>
          <label className="block text-small font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full border border-black/30 rounded-full px-4 py-3 text-small outline-none focus:border-black transition-colors"
          />
        </div>
      )}

      <CardField label="Card number">
        <CardNumberElement options={cardStyle} />
      </CardField>

      <div className="grid grid-cols-2 gap-4">
        <CardField label="Expiry">
          <CardExpiryElement options={cardStyle} />
        </CardField>
        <CardField label="CVC">
          <CardCvcElement options={cardStyle} />
        </CardField>
      </div>

      {errorMessage && <p className="text-small text-red">{errorMessage}</p>}

      <button
        type="submit"
        disabled={!stripe || isSubmitting || (isGuest && !email)}
        className="w-full bg-black text-white rounded-full py-4 px-6 text-small font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Processing..." : `Pay €${amount.toFixed(2)}`}
      </button>

      <p className="text-center text-tiny opacity-40">
        Payments are processed securely by Stripe. We never store your card
        details.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-small underline hover:no-underline"
      >
        ← Change plan
      </button>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SupportersPage({
  user,
  hasActiveSubscription,
}: SupportersPageProps) {
  const [selectedTier, setSelectedTier] = useState<
    "supporter" | "member" | null
  >(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [amount, setAmount] = useState(3);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const activePlanId: PlanId =
    selectedTier === "member"
      ? "member_annual"
      : isAnnual
      ? "supporter_annual"
      : "supporter_monthly";

  const plan = PLANS[activePlanId];
  const minAmount = plan.minAmount / 100;

  function handleSelectTier(tier: "supporter" | "member") {
    setSelectedTier(tier);
    setIsAnnual(false);
    setAmount(tier === "member" ? 50 : 3);
    setApiError(null);
  }

  function handleToggleAnnual(annual: boolean) {
    setIsAnnual(annual);
    setAmount(annual ? 30 : 3);
  }

  function handlePreset(v: number) {
    setAmount(v);
  }

  async function handleContinue() {
    setIsLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: activePlanId, amount }),
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

  if (hasActiveSubscription) {
    return (
      <Layout>
        <PageMeta title="Supporters | Refuge Worldwide" path="supporters/" />
        <section className="min-h-[75vh] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <p className="mb-4">
              You&apos;re already a Refuge supporter — thank you!
            </p>
            <Link
              href="/account"
              className="pill-input bg-black text-white hover:bg-black/80 transition-colors"
            >
              Go to your account
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageMeta title="Supporters | Refuge Worldwide" path="supporters/" />

      <section className="min-h-[75vh]">
        <div className="container-md p-4 sm:p-8">
          <h1 className="font-serif text-large sm:text-xlarge text-center mb-8">
            Become a Refuge Supporter
          </h1>

          <p className="text-center max-w-2xl mx-auto mb-10">
            Join our community of supporters and help keep independent radio
            alive. Like your favourite shows, build your personal playlist, and
            support the artists and community behind Refuge Worldwide.
          </p>

          {/* Plan selection */}
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Supporter card */}
            <div
              onClick={() => handleSelectTier("supporter")}
              className={`border-2 p-8 cursor-pointer transition-colors ${
                selectedTier === "supporter"
                  ? "border-black bg-white"
                  : "border-black/30 bg-white hover:border-black"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-serif text-medium">Supporter</h2>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 transition-colors ${
                    selectedTier === "supporter"
                      ? "border-black bg-black"
                      : "border-black/30"
                  }`}
                />
              </div>
              <p className="text-large font-serif mb-1">
                from €3
                <span className="text-small font-normal">/month</span>
              </p>
              <p className="text-small opacity-50 mb-6">Cancel anytime</p>
              <ul className="space-y-2">
                {[
                  "Like your favourite shows",
                  "Build your personal playlist",
                  "Support Independent radio",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-small">
                    <span className="text-green">&#10003;</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Member card */}
            <div
              onClick={() => handleSelectTier("member")}
              className={`border-2 p-8 cursor-pointer transition-colors bg-black text-white ${
                selectedTier === "member"
                  ? "border-black"
                  : "border-black opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-serif text-medium">Member</h2>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 transition-colors ${
                    selectedTier === "member"
                      ? "border-white bg-white"
                      : "border-white/40"
                  }`}
                />
              </div>
              <p className="text-large font-serif mb-1">
                from €50
                <span className="text-small font-normal">/year</span>
              </p>
              <p className="text-small opacity-50 mb-6">Billed annually</p>
              <ul className="space-y-2">
                {["Everything in Supporter", "Member benefits coming soon"].map(
                  (f) => (
                    <li key={f} className="flex items-start gap-2 text-small">
                      <span className="text-green">&#10003;</span>
                      <span>{f}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Expanded options — shown when a tier is selected and payment form not yet open */}
          {selectedTier && !clientSecret && (
            <div className="max-w-3xl mx-auto mt-0 border-2 border-t-0 border-black p-8 space-y-6">
              {/* Annual checkbox (Supporter only) */}
              {selectedTier === "supporter" && (
                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={isAnnual}
                    onChange={(e) => handleToggleAnnual(e.target.checked)}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                  <span className="text-small">
                    Pay annually{" "}
                    <span className="opacity-60">(save 2 months)</span>
                  </span>
                </label>
              )}

              {/* Pay what you can */}
              <div className="space-y-3">
                <p className="text-small font-medium">
                  Pay what you can{" "}
                  <span className="font-normal opacity-60">
                    (min €{minAmount}/{plan.interval})
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {plan.presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePreset(preset)}
                      className={`px-4 py-2 rounded-full text-small border transition-colors ${
                        amount === preset
                          ? "bg-black text-white border-black"
                          : "border-black/40 hover:border-black"
                      }`}
                    >
                      €{preset}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 border border-black/40 rounded-full px-4 py-2 focus-within:border-black transition-colors">
                    <span className="text-small opacity-60">€</span>
                    <input
                      type="number"
                      min={minAmount}
                      step="1"
                      value={amount}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) setAmount(v);
                      }}
                      className="w-16 text-small outline-none bg-transparent"
                      placeholder="Other"
                    />
                  </div>
                </div>
                {amount < minAmount && (
                  <p className="text-tiny text-red">
                    Minimum is €{minAmount}/{plan.interval}
                  </p>
                )}
              </div>

              {/* CTA */}
              {apiError && <p className="text-small text-red">{apiError}</p>}
              <button
                onClick={handleContinue}
                disabled={isLoading || amount < minAmount}
                className="w-full bg-black text-white rounded-full py-4 px-6 text-small font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {isLoading
                  ? "Loading..."
                  : user
                  ? `Continue — €${amount.toFixed(2)}/${plan.interval}`
                  : "Get started"}
              </button>
            </div>
          )}

          {/* Inline payment form — shown after clicking Continue */}
          {clientSecret && (
            <div className="max-w-3xl mx-auto mt-0 border-2 border-t-0 border-black p-8">
              <Elements key={clientSecret} stripe={getStripe()}>
                <PaymentForm
                  planLabel={plan.label}
                  interval={plan.interval}
                  amount={amount}
                  clientSecret={clientSecret}
                  isGuest={!user}
                  onBack={() => setClientSecret(null)}
                />
              </Elements>
            </div>
          )}

          {!user && (
            <p className="text-center text-small mt-8">
              Already have an account?{" "}
              <Link href="/signin" className="underline hover:no-underline">
                Sign in
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
}

// ─── Server-side auth ─────────────────────────────────────────────────────────

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { props: { user: null, hasActiveSubscription: false } };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  if (subscription) {
    return { redirect: { destination: "/account", permanent: false } };
  }

  return {
    props: {
      user: { id: user.id, email: user.email },
      hasActiveSubscription: false,
    },
  };
}
