import { useRouter } from "next/router";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import { SupportPicker } from "@/components/supportPicker";

/**
 * Dedicated checkout page for the app's "Become a Supporter" button —
 * /supporters/checkout?email=... (see app/(tabs)/account/index.tsx in
 * refugeWorldwideApp). Opened inside the app's in-app browser, so this
 * intentionally skips /support's marketing content, app-download badges,
 * and modal wrapper — a page-in-a-browser-sheet opening a modal on load
 * was one UI layer too many. Just the picker, same as the account page's
 * standalone usage.
 */
export default function SupportersCheckoutPage() {
  const router = useRouter();
  const email =
    typeof router.query.email === "string" ? router.query.email : undefined;

  return (
    <Layout>
      <PageMeta
        title="Become a Supporter | Refuge Worldwide"
        path="supporters/checkout/"
      />

      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          {/* Keep in sync with components/supportModal.tsx's Dialog.Title/
              Description — same copy, but plain markup here since there's
              no Dialog context to hang Radix's a11y-linked title/description
              components off of. */}
          <h1 className="font-serif text-large text-center mb-2">
            Support Refuge Worldwide
          </h1>
          <p className="text-center text-small opacity-60 mb-8 max-w-sm mx-auto">
            Help keep independent radio alive, in whatever amount works for you.
          </p>

          <SupportPicker email={email} fromApp />
        </div>
      </div>
    </Layout>
  );
}
