import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import { SetPasswordForm } from "@/components/setPasswordForm";

type Status = "loading" | "needs-password" | "already-supporter" | "error";

const APP_RETURN_URL = "refugeworldwideapp://supporter-callback";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const sessionId =
    typeof router.query.session_id === "string" ? router.query.session_id : "";
  const fromApp = router.query.app === "1";

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    if (!sessionId) {
      setStatus("error");
      setErrorMessage("We couldn't find your payment session.");
      return;
    }

    fetch(
      `/api/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Something went wrong");
        setStatus(data.hasAccount ? "already-supporter" : "needs-password");
      })
      .catch((error) => {
        setStatus("error");
        setErrorMessage(error.message ?? "Something went wrong");
      });
  }, [router.isReady, sessionId]);

  // An app-first signup is always status "active" (see pages/api/auth/signup.ts)
  // well before they ever pay, so this is the only branch app checkouts hit
  // — hasAccount is true from the moment they signed up, not something the
  // payment itself changes. Hand back to the app rather than showing the
  // website's "sign in" messaging, which doesn't apply to them.
  useEffect(() => {
    if (status === "already-supporter" && fromApp) {
      window.location.href = APP_RETURN_URL;
    }
  }, [status, fromApp]);

  const downloadAppSection = (
    <>
      <p className="mb-4">Download the app.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href="https://apps.apple.com/au/app/refuge-worldwide/id6785827225"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <img
            src="/images/app-store-badge.svg"
            alt="Download on the App Store"
            className="h-14"
          />
        </a>
        <a
          href="https://play.google.com/store/apps/details?id=com.refugeworldwide.app&hl=en-US"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <img
            src="/images/google-play-badge.png"
            alt="Get it on Google Play"
            className="h-20"
          />
        </a>
      </div>
    </>
  );

  return (
    <Layout>
      <PageMeta
        title="Welcome to Supporters | Refuge Worldwide"
        path="supporters/success/"
      />

      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center">
          <h1 className="font-serif text-large mb-12 mt-4">
            Thanks for supporting Refuge Worldwide!
          </h1>

          {status === "loading" && (
            <p className="mb-8">Confirming your payment...</p>
          )}

          {status === "error" && (
            <p className="mb-8 text-red">{errorMessage}</p>
          )}

          {status === "already-supporter" && fromApp && (
            <>
              <p className="mb-8">
                Taking you back to the app —{" "}
                <a href={APP_RETURN_URL} className="underline">
                  tap here
                </a>{" "}
                if it doesn&apos;t open automatically.
              </p>
            </>
          )}

          {status === "already-supporter" && !fromApp && (
            <>
              <p className="mb-8">
                You already have an account —{" "}
                <Link href="/signin" className="underline">
                  sign in
                </Link>{" "}
                to get started.
              </p>
              {downloadAppSection}
            </>
          )}

          {status === "needs-password" && (
            <div className="text-left mb-8">
              <SetPasswordForm
                apiPath="/api/stripe/complete-signup"
                heading="Your payment has been confirmed, just a few more steps"
                headingClassName="text-small"
                successMessage="You're all set! Taking you to your account..."
                queryKey="session_id"
                missingTokenMessage="We couldn't find your payment session."
                successRedirect="/account"
                includeUsername
                submitLabel="Finish account setup"
                footer={
                  <div className="text-center mt-8">{downloadAppSection}</div>
                }
                embedded
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
