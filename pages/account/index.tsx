import type { GetServerSidePropsContext } from "next";
import { createClient } from "@/lib/supabase/server-props";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type AccountPageProps = {
  user: { id: string; email: string; created_at: string };
  profile: { username: string } | null;
  subscription: { status: string; current_period_end: string } | null;
};

export default function AccountPage({
  user,
  profile,
  subscription,
}: AccountPageProps) {
  const isPaidSupporter =
    subscription?.status === "active" || subscription?.status === "past_due";
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  async function handleManageSubscription() {
    setIsPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        alert(data.error || "Failed to open billing portal");
      }
    } catch {
      alert("Failed to open billing portal");
    } finally {
      setIsPortalLoading(false);
    }
  }

  const linkItems = [
    { label: "Favorite Shows", href: "/account/likes" },
    { label: "Account Settings", href: "/account/settings" },
    { label: "Help", href: "/support" },
  ];

  return (
    <Layout>
      <PageMeta title="Account | Refuge Worldwide" path="account/" />

      <div className="min-h-[75vh] bg-blue p-4 sm:p-8">
        <div className="max-w-md mx-auto">
          {/* Profile Card */}
          <div className="bg-black text-white rounded-xl p-4 mb-6">
            <h1 className="font-sans text-default font-medium text-center mb-6">
              {profile?.username || user.email}
            </h1>

            {/* Refuge Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 relative">
                <Image
                  src="/images/footer-smile.svg"
                  alt="Refuge Worldwide"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Info Grid */}
            <div className="flex flex-col text-small">
              <div className="flex justify-between">
                <span className="font-medium">Joined:</span>
                <span>{formatDate(user.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Subscription:</span>
                <span className="capitalize">
                  {isPaidSupporter ? subscription?.status : "Free"}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {linkItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block w-full border-2 border-black rounded-full py-4 px-6 text-center text-small font-medium hover:bg-black hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {isPaidSupporter ? (
              <button
                onClick={handleManageSubscription}
                disabled={isPortalLoading}
                title="Opens in a new tab"
                className="w-full border-2 border-black rounded-full py-4 px-6 text-center text-small font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50"
              >
                {isPortalLoading ? "Loading..." : "Manage Subscription ↗"}
              </button>
            ) : (
              <Link
                href="/supporters"
                className="block w-full  border-2 border-black rounded-full py-4 px-6 text-center text-small font-medium hover:bg-black hover:text-white transition-colors"
              >
                Become a Supporter
              </Link>
            )}

            {/* Sign Out Button */}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="w-full  border-2 border-black rounded-full py-4 px-6 text-center text-small font-medium hover:bg-black hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </form>
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

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  // Get subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .in("status", ["active", "past_due", "trialing"])
    .maybeSingle();

  return {
    props: {
      user: { id: user.id, email: user.email, created_at: user.created_at },
      profile,
      subscription,
    },
  };
}
