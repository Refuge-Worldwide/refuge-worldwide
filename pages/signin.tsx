import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import { useRouter } from "next/router";
import { useState } from "react";
import { createClient } from "@/lib/supabase/component";

const LoginPage = () => {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function logIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error(error);
    }
    router.push("/");
  }
  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error(error);
    }
    router.push("/");
  }

  return (
    <Layout>
      <PageMeta title="Sign in | Refuge Worldwide" path="signin/" />
      <div className="min-h-[75vh] p-4">
        <div className="max-w-md mx-auto my-32 lg:my-40 border-2 border-black p-8">
          <h1 className="font-sans font-medium text-center mb-8">
            Sign in to Refuge Worldwide
          </h1>
          <main>
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-2 text-small">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pill-input"
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-small">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pill-input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={logIn}
                  className="flex-1 bg-black text-white rounded-full py-3 px-6 text-small hover:bg-black/80 transition-colors"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={signUp}
                  className="flex-1 border-2 border-black rounded-full py-3 px-6 text-small hover:bg-black hover:text-white transition-colors"
                >
                  Sign up
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
