import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
  return (
    <Layout>
      <PageMeta
        title="Welcome to Supporters | Refuge Worldwide"
        path="supporters/success/"
      />

      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-xl text-center">
          <div className="text-6xl mb-6">&#10003;</div>
          <h1 className="font-serif text-large mb-4">
            Welcome to Refuge Supporters!
          </h1>
          <p className="mb-8">
            Thank you for your support. Your subscription is now active and
            you&apos;re helping keep independent radio alive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/profile"
              className="pill-input bg-black text-white hover:bg-black/80 transition-colors text-center"
            >
              Go to your profile
            </Link>
            <Link
              href="/radio"
              className="pill-input bg-white hover:bg-grey transition-colors text-center"
            >
              Browse the archive
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
