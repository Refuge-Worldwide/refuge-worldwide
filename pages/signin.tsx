import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { SupportButton } from "@/components/supportButton";

const SignInPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setIsSubmitting(false);
        return;
      }

      router.push("/account");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <PageMeta title="Sign in | Refuge Worldwide" path="signin/" />
      <div className="min-h-[75vh] p-4">
        <div className="max-w-xl mx-auto my-32 lg:my-40 border-2 border-black p-8">
          <h1 className="font-sans font-medium text-center mb-8">
            Sign in to Refuge Worldwide
          </h1>
          <main>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-2 text-small">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pill-input"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="text-small">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-tiny underline hover:no-underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pill-input"
                />
              </div>

              {error && <p className="text-small text-red">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white rounded-full py-3 px-6 text-small hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="text-center text-small mt-6">
              Don&apos;t have an account?{" "}
              <SupportButton className="underline hover:no-underline">
                Become a supporter
              </SupportButton>
              .
            </p>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default SignInPage;
