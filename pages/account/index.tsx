import type { GetServerSidePropsContext } from "next";
import { getSessionUser } from "@/lib/directus/session";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { SupportPicker } from "@/components/supportPicker";
import { FavouritesContent } from "@/components/account/favouritesContent";
import { SettingsContent } from "@/components/account/settingsContent";

type AccountPageProps = {
  user: {
    id: string;
    email: string;
    first_name?: string | null;
    subscription_status?: string | null;
    supporter_amount_cents?: number | null;
    supporter_interval?: "month" | "year" | null;
  };
};

type Tab = "favourites" | "settings" | "help";

export default function AccountPage({ user }: AccountPageProps) {
  const router = useRouter();
  const isPaidSupporter =
    user.subscription_status === "active" ||
    user.subscription_status === "past_due";
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSupportPicker, setShowSupportPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("favourites");

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

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
    }
  }

  const linkItems = [
    { label: "Favorite Shows", href: "/account/likes" },
    { label: "Account Settings", href: "/account/settings" },
    { label: "Help", href: "/support" },
  ];

  const profileCard = (
    <div className="bg-black text-white rounded-xl p-4 md:aspect-[1.586/1] flex flex-col justify-between gap-6">
      <p className="font-sans text-small font-medium text-center">
        {user.email}
      </p>

      <div className="flex justify-center">
        <div className="w-20 h-20 relative">
          <Image
            src="/images/footer-smile.svg"
            alt="Refuge Worldwide"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex flex-col text-small">
        <div className="flex justify-between">
          <span className="font-medium">Subscription:</span>
          <span className="capitalize">
            {isPaidSupporter
              ? `${user.subscription_status} — €${(
                  (user.supporter_amount_cents ?? 0) / 100
                ).toFixed(2)}/${user.supporter_interval}`
              : "Free"}
          </span>
        </div>
      </div>
    </div>
  );

  const supporterOrManageButton = isPaidSupporter ? (
    <button
      onClick={handleManageSubscription}
      disabled={isPortalLoading}
      title="Opens in a new tab"
      className="w-full border-2 border-black py-4 px-6 text-center text-small font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50"
    >
      {isPortalLoading ? "Loading..." : "Manage Subscription ↗"}
    </button>
  ) : !showSupportPicker ? (
    <button
      onClick={() => setShowSupportPicker(true)}
      className="block w-full border-2 border-black py-4 px-6 text-center text-small font-medium hover:bg-black hover:text-white transition-colors"
    >
      Become a Supporter
    </button>
  ) : null;

  return (
    <Layout>
      <PageMeta title="Account | Refuge Worldwide" path="account/" />

      {/* mobile */}
      <div className="md:hidden min-h-[75vh] bg-white p-4 sm:p-8">
        <div className="max-w-md mx-auto">
          <div className="mb-6">{profileCard}</div>

          <div className="space-y-3">
            {linkItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block w-full border-2 border-black py-4 px-6 text-center text-small font-medium hover:bg-black hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {supporterOrManageButton}

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full border-2 border-black py-4 px-6 text-center text-small font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>

          {showSupportPicker && (
            <div className="mt-6">
              <SupportPicker />
            </div>
          )}
        </div>
      </div>

      {/* desktop */}
      <div className="hidden md:block min-h-[75vh] bg-white p-8">
        <div className="max-w-[1320px] mx-auto flex gap-8 items-start">
          <div className="max-w-sm w-full flex-shrink-0">
            <h1 className="font-sans font-normal text-base mb-8">Account</h1>
            {profileCard}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-start mb-8">
              <div className="inline-flex border border-black rounded-full p-1">
                {(
                  [
                    { key: "favourites", label: "Favourites" },
                    { key: "settings", label: "Settings" },
                    { key: "help", label: "Help" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-2 rounded-full text-small font-medium transition-colors ${
                      activeTab === tab.key
                        ? "bg-black text-white"
                        : "hover:opacity-60"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "favourites" && <FavouritesContent />}
            {activeTab === "settings" && <SettingsContent user={user} />}
            {activeTab === "help" && (
              <div className="border-2 border-black p-6 text-center">
                <p className="text-small mb-4">
                  Need help with your account or support? Get in touch.
                </p>
                <Link
                  href="/support"
                  className="inline-block bg-black text-white py-3 px-6 text-small hover:bg-black/80 transition-colors"
                >
                  Go to Support
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const user = await getSessionUser(
    context.req,
    context.res,
    "id,email,first_name,stripe_customer_id,subscription_status,supporter_amount_cents,supporter_interval"
  );

  if (!user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  return {
    props: { user },
  };
}
