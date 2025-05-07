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
        <div className="max-w-xl mx-auto my-32 lg:my-40 border-2 border-black p-6">
          <h1 className="font-sans font-medium text-center">
            Sign in to Refuge Worldwide
          </h1>
          <main>
            <form>
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="password">Password:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={logIn}>
                Log in
              </button>
              <button type="button" onClick={signUp}>
                Sign up
              </button>
            </form>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
