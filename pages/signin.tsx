import { Auth } from "@supabase/auth-ui-react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
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

  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ??
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
      "http://localhost:3000/";
    // Make sure to include `https://` when not localhost.
    url = url.includes("http") ? url : `https://${url}`;
    // Make sure to include a trailing `/`.
    url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
    return url;
  };

  return (
    <Layout>
      <PageMeta title="Sign in | Refuge Worldwide" path="signin/" />
      <div className="min-h-[75vh] p-4">
        <div className="max-w-xl mx-auto my-32 lg:my-40 border-2 border-black p-6">
          <h1 className="font-sans font-medium text-center">
            Sign in to Refuge Worldwide
          </h1>
          {/* to do: custom sign in/sign up once https://supabase.com/docs/guides/auth/auth-helpers/nextjs?language=ts#client-side */}
          <Auth
            view="magic_link"
            redirectTo={getURL()}
            appearance={{
              variables: {
                default: {
                  colors: {
                    brand: "black",
                    brandAccent: "#4d7cff",
                  },
                },
              },
              extend: false,
              className: {
                input: "pill-input mb-6",
                button: "pill-input mt-6 hover:bg-black hover:text-white",
                container: "mt-12",
                message:
                  "message bg-orange border border-black w-full p-4 block mt-6 text-center text-small",
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
