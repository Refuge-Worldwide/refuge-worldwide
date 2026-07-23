import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import Link from "next/link";
import { FormEvent, useState } from "react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});

    setIsSubmitting(false);
    setSubmitted(true);
  }

  return (
    <Layout>
      <PageMeta
        title="Forgot password | Refuge Worldwide"
        path="forgot-password/"
      />
      <div className="min-h-[75vh] p-4">
        <div className="max-w-md mx-auto my-32 lg:my-40 border-2 border-black p-8">
          <h1 className="font-sans font-medium text-center mb-8">
            Reset your password
          </h1>

          {submitted ? (
            <p className="text-center text-small">
              If an account exists for that email, we&apos;ve sent a link to
              reset your password.
            </p>
          ) : (
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white rounded-full py-3 px-6 text-small hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          <p className="text-center text-small mt-6">
            <Link href="/signin" className="underline hover:no-underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
