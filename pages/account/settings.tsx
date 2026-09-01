import type { GetServerSidePropsContext } from "next";
import { useState } from "react";
import { getSessionUser } from "@/lib/directus/session";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { SettingsContent } from "@/components/account/settingsContent";
import { PaymentFailedNotice } from "@/components/account/paymentFailedNotice";

type SettingsPageProps = {
  user: {
    id: string;
    email: string;
    first_name?: string | null;
    subscription_status?: string | null;
    payment_failed_at?: string | null;
  };
};

export default function SettingsPage({ user }: SettingsPageProps) {
  const [isPortalLoading, setIsPortalLoading] = useState(false);

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

  return (
    <Layout>
      <PageMeta
        title="Account Settings | Refuge Worldwide"
        path="account/settings/"
      />

      <div className="min-h-[75vh] bg-white">
        <div className="p-4 sm:p-8">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 hover:underline mb-6"
            >
              <IoArrowBack className="w-5 h-5" />
              <span>Back to Account</span>
            </Link>

            <h1 className="font-sans font-normal text-large mb-2">
              Account Settings
            </h1>
            <p className="text-small text-black/60">
              Manage your profile and account details
            </p>

            {user.payment_failed_at && (
              <div className="mt-6">
                <PaymentFailedNotice
                  onManage={handleManageSubscription}
                  isLoading={isPortalLoading}
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-8 min-h-[50vh]">
          <div className="max-w-2xl mx-auto">
            <SettingsContent user={user} />
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
    "id,email,first_name,subscription_status,payment_failed_at"
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
