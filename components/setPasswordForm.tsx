import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, ReactNode, useEffect, useState } from "react";

export function SetPasswordForm({
  apiPath,
  heading,
  successMessage,
  includeUsername = false,
  queryKey = "token",
  missingTokenMessage = "This link is missing its token.",
  successRedirect,
  embedded = false,
  submitLabel = "Set password",
  footer,
  headingClassName = "",
}: {
  apiPath: string;
  heading: string;
  successMessage: string;
  includeUsername?: boolean;
  // Which URL query param carries the identifier posted to apiPath (an
  // invite/reset token, or — for the post-checkout flow — a Stripe
  // session_id). Also used as the JSON body key.
  queryKey?: string;
  missingTokenMessage?: string;
  // Path to redirect to if apiPath reports the caller is now logged in
  // (e.g. complete-signup.ts sets session cookies itself). Ignored if the
  // response doesn't report loggedIn: true — falls back to the normal
  // "Sign in" link so callers that don't log in anyone (accept-invite.ts)
  // are unaffected.
  successRedirect?: string;
  // Drops the standalone-page min-height/margins for use inside another
  // page's own layout (e.g. the supporters success page).
  embedded?: boolean;
  // Text for the submit button (not shown while submitting — that always
  // reads "Saving...").
  submitLabel?: string;
  // Extra content rendered inside the box, below everything else — e.g. a
  // "download the app" reminder on the post-checkout flow.
  footer?: ReactNode;
  // Extra classes appended to the heading — e.g. to size down a longer,
  // more sentence-like heading to regular text size.
  headingClassName?: string;
}) {
  const router = useRouter();
  const identifier =
    typeof router.query[queryKey] === "string"
      ? (router.query[queryKey] as string)
      : "";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (success && loggedIn && successRedirect) {
      router.push(successRedirect);
    }
  }, [success, loggedIn, successRedirect, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          includeUsername
            ? { [queryKey]: identifier, password, username }
            : { [queryKey]: identifier, password }
        ),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setIsSubmitting(false);
        return;
      }

      setLoggedIn(!!data.loggedIn);
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  const box = (
    <div
      className={
        embedded
          ? "border-2 border-black p-8"
          : "max-w-md mx-auto my-32 lg:my-40 border-2 border-black p-8"
      }
    >
      <h1
        className={`font-sans font-medium text-center mb-8 ${headingClassName}`}
      >
        {heading}
      </h1>

      {success ? (
        <>
          <p className="text-center text-small mb-6">{successMessage}</p>
          {!(loggedIn && successRedirect) && (
            <Link
              href="/signin"
              className="block w-full text-center bg-black text-white rounded-full py-3 px-6 text-small hover:bg-black/80 transition-colors"
            >
              Sign in
            </Link>
          )}
        </>
      ) : !identifier ? (
        <p className="text-center text-small text-red">{missingTokenMessage}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {includeUsername && (
            <div>
              <label htmlFor="username" className="block mb-2 text-small">
                Username (you can change this later)
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pill-input"
              />
            </div>
          )}
          <div>
            <label htmlFor="password" className="block mb-2 text-small">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pill-input"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-2 text-small">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pill-input"
            />
          </div>

          {error && <p className="text-small text-red">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white rounded-full py-3 px-6 text-small hover:bg-black/80 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </form>
      )}

      {footer}
    </div>
  );

  return embedded ? box : <div className="min-h-[75vh] p-4">{box}</div>;
}
