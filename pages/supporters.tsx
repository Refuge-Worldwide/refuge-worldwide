import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import Link from "next/link";

export default function SupportersPage() {
  return (
    <Layout>
      <PageMeta title="Supporters | Refuge Worldwide" path="supporters/" />

      <section className="min-h-[75vh]">
        <div className="container-md p-4 sm:p-8">
          <h1 className="font-serif text-large sm:text-xlarge text-center mb-8">
            Become a Refuge Supporter
          </h1>

          <p className="text-center max-w-2xl mx-auto mb-12">
            Join our community of supporters and help keep independent radio
            alive. Like your favourite shows, build your personal playlist, and
            support the artists and community behind Refuge Worldwide.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="border-2 border-black p-8">
              <h2 className="font-serif text-medium mb-4">Free Supporter</h2>
              <p className="text-large font-medium mb-6">Free</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green">&#10003;</span>
                  <span>Create an account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green">&#10003;</span>
                  <span>Like your favourite shows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green">&#10003;</span>
                  <span>Build your personal playlist</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green">&#10003;</span>
                  <span>Support the community</span>
                </li>
              </ul>

              <Link
                href="/signin"
                className="block w-full text-center pill-input bg-white hover:bg-grey transition-colors"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Paid Tier */}
            <div className="border-2 border-black p-8 bg-black text-white">
              <h2 className="font-serif text-medium mb-4">Paid Supporter</h2>
              <p className="text-large font-medium mb-6">
                5 EUR<span className="text-small font-normal">/month</span>
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green">&#10003;</span>
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green">&#10003;</span>
                  <span>Support Refuge financially</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green">&#10003;</span>
                  <span>Help keep independent radio alive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green">&#10003;</span>
                  <span>Cancel anytime</span>
                </li>
              </ul>

              <Link
                href="/signin"
                className="block w-full text-center pill-input bg-white text-black hover:bg-grey transition-colors"
              >
                Sign Up & Subscribe
              </Link>
            </div>
          </div>

          <p className="text-center text-small mt-12 max-w-xl mx-auto">
            Already have an account?{" "}
            <Link href="/signin" className="underline hover:no-underline">
              Sign in
            </Link>{" "}
            to access your profile and liked shows.
          </p>
        </div>
      </section>
    </Layout>
  );
}
