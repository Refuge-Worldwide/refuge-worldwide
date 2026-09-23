import { useRouter } from "next/router";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import { SupportPicker } from "@/components/supportPicker";

// Linked from the "confirm your account" email sent to app signups
// (/supporters/checkout?email=...). ?app=1 means the app itself opened it,
// so success hands back to the app instead of showing the web message.
export default function SupportersCheckoutPage() {
  const router = useRouter();
  const email =
    typeof router.query.email === "string" ? router.query.email : undefined;
  const fromApp = router.query.app === "1";

  return (
    <Layout>
      <PageMeta
        title="Confirm Your Account | Refuge Worldwide"
        path="supporters/checkout/"
      />

      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          {/* Deliberately different copy from components/supportModal.tsx's
              Dialog.Title/Description — this page is specifically for an
              app user finishing the account they already started, not a
              first-time web visitor, so it frames it as completing setup
              rather than the general "become a supporter" pitch. */}
          <h1 className="font-serif text-large text-center mb-2">
            Confirm your account
          </h1>
          <p className="text-center text-small opacity-60 mb-8 max-w-sm mx-auto">
            Choose your supporter subscription, in whatever amount works for
            you, to activate your account.
          </p>

          <SupportPicker email={email} fromApp={fromApp} />
        </div>
      </div>
    </Layout>
  );
}
