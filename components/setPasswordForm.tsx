import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";

export function SetPasswordForm({
  apiPath,
  heading,
  successMessage,
  includeUsername = false,
}: {
  apiPath: string;
  heading: string;
  successMessage: string;
  includeUsername?: boolean;
}) {
  const router = useRouter();
  const token =
    typeof router.query.token === "string" ? router.query.token : "";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
          includeUsername ? { token, password, username } : { token, password }
        ),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[75vh] p-4">
      <div className="max-w-md mx-auto my-32 lg:my-40 border-2 border-black p-8">
        <h1 className="font-sans font-medium text-center mb-8">{heading}</h1>

        {success ? (
          <>
            <p className="text-center text-small mb-6">{successMessage}</p>
            <Link
              href="/signin"
              className="block w-full text-center bg-black text-white rounded-full py-3 px-6 text-small hover:bg-black/80 transition-colors"
            >
              Sign in
            </Link>
          </>
        ) : !token ? (
          <p className="text-center text-small text-red">
            This link is missing its token.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {includeUsername && (
              <div>
                <label htmlFor="username" className="block mb-2 text-small">
                  Username
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
              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-small"
              >
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
              {isSubmitting ? "Saving..." : "Set password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
