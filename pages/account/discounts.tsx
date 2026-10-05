import type { GetServerSidePropsContext } from "next";
import { getSessionUser } from "@/lib/directus/session";
import { getUserAccess } from "@/lib/directus/staff";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { DiscountsContent } from "@/components/account/discountsContent";

type DiscountsPageProps = {
  user: { id: string; email: string };
};

export default function DiscountsPage({ user }: DiscountsPageProps) {
  return (
    <Layout>
      <PageMeta
        title="Discounts | Refuge Worldwide"
        path="account/discounts/"
      />

      <div className="min-h-[75vh] bg-white">
        <div className="p-4 sm:p-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 hover:underline mb-6"
            >
              <IoArrowBack className="w-5 h-5" />
              <span>Back to Account</span>
            </Link>

            <h1 className="font-sans font-normal text-large mb-2">Discounts</h1>
            <p className="text-small text-black/60">Supporter discount codes</p>
          </div>
        </div>

        <div className="p-4 sm:p-8 min-h-[50vh]">
          <div className="max-w-4xl mx-auto">
            <DiscountsContent />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const user = await getSessionUser(context.req, context.res);

  if (!user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  const access = await getUserAccess(user.id);
  if (!access.hasSupporterAccess) {
    return {
      redirect: {
        destination: "/account",
        permanent: false,
      },
    };
  }

  return {
    props: { user },
  };
}
