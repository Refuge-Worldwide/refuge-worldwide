import type { GetServerSidePropsContext } from "next";
import { createClient } from "@/lib/supabase/server-props";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import Link from "next/link";
import Image from "next/image";

type AccountPageProps = {
  user: { id: string; email: string };
  profile: { username: string; created_at: string } | null;
  subscription: { status: string; current_period_end: string } | null;
};

export default function AccountPage({
  user,
  profile,
  subscription,
}: AccountPageProps) {
  const isPaidSupporter =
    subscription?.status === "active" || subscription?.status === "past_due";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const menuItems = [
    { label: "Favorite Shows", href: "/account/likes" },
    { label: "Manage Subscription", href: "/account/billing" },
    { label: "Account Settings", href: "/account/settings" },
    { label: "Help", href: "/support" },
  ];

  return (
    <Layout>
      <PageMeta title="Account | Refuge Worldwide" path="account/" />

      <div className="min-h-[75vh] bg-blue p-4 sm:p-8">
        <div className="max-w-md mx-auto">
          {/* Profile Card */}
          <div className="bg-pink rounded-3xl p-6 sm:p-8 mb-6">
            <h1 className="font-serif text-large text-center mb-6">
              {profile?.username || "Supporter"}
            </h1>

            {/* Refuge Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 relative">
                <Image
                  src="/images/navigation-smile.svg"
                  alt="Refuge Worldwide"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-small">
              <div>
                <p className="font-medium">Joined:</p>
              </div>
              <div>
                <p>
                  {profile?.created_at ? formatDate(profile.created_at) : "—"}
                </p>
              </div>
              <div>
                <p className="font-medium">Subscription:</p>
              </div>
              <div>
                <p className="capitalize">
                  {isPaidSupporter ? subscription?.status : "Free"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block w-full bg-white border-2 border-black rounded-full py-4 px-6 text-center text-small font-medium hover:bg-grey transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {/* Sign Out Button */}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="w-full bg-white border-2 border-black rounded-full py-4 px-6 text-center text-small font-medium hover:bg-grey transition-colors"
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
    .select("username, created_at")
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
      user: { id: user.id, email: user.email },
      profile,
      subscription,
    },
  };
}
