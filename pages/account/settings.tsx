import type { GetServerSidePropsContext } from "next";
import { getSessionUser } from "@/lib/directus/session";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { SettingsContent } from "@/components/account/settingsContent";

type SettingsPageProps = {
  user: {
    id: string;
    email: string;
    first_name?: string | null;
    subscription_status?: string | null;
  };
};

export default function SettingsPage({ user }: SettingsPageProps) {
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
    "id,email,first_name,subscription_status"
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
