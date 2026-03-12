import type { GetServerSidePropsContext } from "next";
import { createClient as createServerClient } from "@/lib/supabase/server-props";
import { createClient } from "@/lib/supabase/component";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import Link from "next/link";
import { useState } from "react";
import { IoArrowBack } from "react-icons/io5";

type SettingsPageProps = {
  user: { id: string; email: string };
  profile: { username: string } | null;
};

export default function SettingsPage({ user, profile }: SettingsPageProps) {
  const supabase = createClient();
  const [username, setUsername] = useState(profile?.username || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully" });
    }

    setIsSaving(false);
  }

  return (
    <Layout>
      <PageMeta
        title="Account Settings | Refuge Worldwide"
        path="account/settings/"
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
              Account Settings
            </h1>
            <p className="text-small text-white/80">
              Manage your profile and account details
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-4 sm:p-8 min-h-[50vh]">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Profile Settings */}
            <div className="border-2 border-black rounded-3xl p-6">
              <h2 className="font-medium text-base mb-4">Profile</h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block mb-2 text-small">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pill-input"
                    required
                    minLength={3}
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-small">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="pill-input bg-grey cursor-not-allowed"
                  />
                  <p className="text-tiny text-black/60 mt-1">
                    Contact support to change your email address
                  </p>
                </div>

                {message && (
                  <p
                    className={`text-small ${
                      message.type === "error" ? "text-red" : "text-green"
                    }`}
                  >
                    {message.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-black text-white rounded-full py-3 px-6 text-small hover:bg-black/80 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="border-2 border-red rounded-3xl p-6">
              <h2 className="font-medium text-base mb-4 text-red">
                Danger Zone
              </h2>

              <p className="text-small mb-4">
                Deleting your account will permanently remove all your data,
                including liked shows and subscription history.
              </p>

              <Link
                href="mailto:support@refugeworldwide.com?subject=Delete my account"
                className="text-small text-red underline hover:no-underline"
              >
                Request Account Deletion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createServerClient(context);
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

  return {
    props: {
      user: { id: user.id, email: user.email },
      profile,
    },
  };
}
