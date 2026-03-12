import type { GetServerSidePropsContext } from "next";
import { createClient } from "@/lib/supabase/server-props";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import Link from "next/link";
import useSWR from "swr";
import { useState } from "react";
import { IoArrowBack } from "react-icons/io5";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type MolliePayment = {
  id: string;
  amount: { value: string; currency: string };
  status: string;
  description: string;
  createdAt: string;
  paidAt: string | null;
  method: string | null;
};

type MollieSubscription = {
  id: string;
  status: string;
  amount: { value: string; currency: string };
  interval: string;
  description: string;
  nextPaymentDate: string | null;
  startDate: string;
  canceledAt: string | null;
};

type BillingPageProps = {
  user: { id: string; email: string };
  subscription: { status: string; current_period_end: string } | null;
};

export default function BillingPage({ user, subscription }: BillingPageProps) {
  const { data: paymentsData } = useSWR<{ payments: MolliePayment[] }>(
    "/api/mollie/payments",
    fetcher
  );
  const { data: subscriptionData } = useSWR<{
    subscription: MollieSubscription | null;
  }>("/api/mollie/subscription", fetcher);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const isPaidSupporter =
    subscription?.status === "active" || subscription?.status === "past_due";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: { value: string; currency: string }) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: amount.currency,
    }).format(parseFloat(amount.value));
  };

  async function handleSubscribe() {
    setIsSubscribing(true);
    try {
      const res = await fetch("/api/mollie/create-checkout", {
        method: "POST",
      });
      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Failed to create checkout");
        setIsSubscribing(false);
      }
    } catch (err) {
      alert("Failed to create checkout");
      setIsSubscribing(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    setIsCanceling(true);
    try {
      const res = await fetch("/api/mollie/cancel-subscription", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error || "Failed to cancel subscription");
        setIsCanceling(false);
      }
    } catch (err) {
      alert("Failed to cancel subscription");
      setIsCanceling(false);
    }
  }

  return (
    <Layout>
      <PageMeta
        title="Manage Subscription | Refuge Worldwide"
        path="account/billing/"
      />

      <div className="min-h-[75vh] bg-blue">
        {/* Header */}
        <div className="p-4 sm:p-8">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-white hover:underline mb-6"
            >
              <IoArrowBack className="w-5 h-5" />
              <span>Back to Account</span>
            </Link>

            <h1 className="font-serif text-large text-white mb-2">
              Manage Subscription
            </h1>
            <p className="text-small text-white/80">
              View and manage your supporter subscription
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-4 sm:p-8 min-h-[50vh]">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Current Subscription */}
            <div className="border-2 border-black rounded-3xl p-6">
              <h2 className="font-medium text-base mb-4">Current Plan</h2>

              {isPaidSupporter && subscriptionData?.subscription ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-small">
                    <div>
                      <p className="text-black/60">Plan</p>
                      <p className="font-medium">Paid Supporter</p>
                    </div>
                    <div>
                      <p className="text-black/60">Amount</p>
                      <p>
                        {formatCurrency(subscriptionData.subscription.amount)} /{" "}
                        {subscriptionData.subscription.interval}
                      </p>
                    </div>
                    <div>
                      <p className="text-black/60">Started</p>
                      <p>
                        {formatDate(subscriptionData.subscription.startDate)}
                      </p>
                    </div>
                    {subscriptionData.subscription.nextPaymentDate && (
                      <div>
                        <p className="text-black/60">Next Payment</p>
                        <p>
                          {formatDate(
                            subscriptionData.subscription.nextPaymentDate
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-black/10">
                    <button
                      onClick={handleCancel}
                      disabled={isCanceling}
                      className="text-small text-red underline hover:no-underline disabled:opacity-50"
                    >
                      {isCanceling ? "Canceling..." : "Cancel Subscription"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-small">
                    You&apos;re currently on the free plan. Become a paid
                    supporter to help keep Refuge Worldwide running.
                  </p>
                  <button
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="bg-black text-white rounded-full py-3 px-6 text-small hover:bg-black/80 transition-colors disabled:opacity-50"
                  >
                    {isSubscribing
                      ? "Loading..."
                      : "Become a Supporter – €5/month"}
                  </button>
                </div>
              )}
            </div>

            {/* Payment History */}
            {paymentsData?.payments && paymentsData.payments.length > 0 && (
              <div className="border-2 border-black rounded-3xl p-6">
                <h2 className="font-medium text-base mb-4">Payment History</h2>
                <p className="text-small text-black/60 mb-4">
                  Payment confirmations are sent to your email by Mollie.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-small">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="text-left py-2 font-medium">Date</th>
                        <th className="text-left py-2 font-medium">Amount</th>
                        <th className="text-left py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsData.payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-black/10"
                        >
                          <td className="py-3">
                            {formatDate(payment.paidAt || payment.createdAt)}
                          </td>
                          <td className="py-3">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 text-tiny rounded-full ${
                                payment.status === "paid"
                                  ? "bg-green text-white"
                                  : payment.status === "failed"
                                  ? "bg-red text-white"
                                  : "bg-grey"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  // Get subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .in("status", ["active", "past_due", "trialing"])
    .maybeSingle();

  return {
    props: {
      user: { id: user.id, email: user.email },
      subscription,
    },
  };
}
