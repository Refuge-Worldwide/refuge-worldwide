import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";

const LoginPage = () => {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  // if logged in then redirect to calendar
  if (user) {
    router.push("/admin/calendar");
  }

  return (
    <Layout>
      <PageMeta title="Sign in | Refuge Worldwide" path="signin/" />
      <div className="min-h-[75vh] ">
        <div className="max-w-lg mx-auto my-12 lg:my-40 border-2 border-black p-6">
          <h1 className="font-sans font-medium text-center">
            Sign in to Refuge Worldwide
          </h1>
          <Auth
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "black",
                    brandAccent: "#4d7cff",
                  },
                },
              },
            }}
            supabaseClient={supabaseClient}
            providers={[]}
            socialLayout="horizontal"
            showLinks={false}
          />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
