"use client";

import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import Link from "next/link";
import { useState } from "react";

export default function SupportersPage() {
  const [annual, setAnnual] = useState(false);

  const supporterPlan = annual ? "supporter_annual" : "supporter_monthly";

  return (
    <Layout>
      <PageMeta title="Supporters | Refuge Worldwide" path="supporters/" />

      <section className="min-h-[75vh]">
        <div className="container-md p-4 sm:p-8">
          <h1 className="font-serif text-large sm:text-xlarge text-center mb-8">
            Become a Refuge Supporter
          </h1>

          <p className="text-center max-w-2xl mx-auto mb-10">
            Join our community of supporters and help keep independent radio
            alive. Like your favourite shows, build your personal playlist, and
            support the artists and community behind Refuge Worldwide.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={!annual ? "font-medium" : "opacity-50"}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual((v) => !v)}
              aria-label="Toggle billing period"
              className={`relative w-12 h-6 rounded-full transition-colors border border-black ${
                annual ? "bg-black" : "bg-white"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${
                  annual ? "translate-x-6 bg-white" : "bg-black"
                }`}
              />
            </button>
            <span className={annual ? "font-medium" : "opacity-50"}>
              Annual{" "}
              <span className="text-small font-normal opacity-70">
                (save 2 months)
              </span>
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Supporter */}
            <div className="border-2 border-black p-8 flex flex-col">
              <h2 className="font-serif text-medium mb-2">Supporter</h2>
              {annual ? (
                <p className="text-large font-medium mb-1">
                  €30<span className="text-small font-normal">/year</span>
                </p>
              ) : (
                <p className="text-large font-medium mb-1">
                  €3<span className="text-small font-normal">/month</span>
                </p>
              )}
              <p className="text-small opacity-50 mb-8">
                {annual ? "Billed annually" : "Billed monthly, cancel anytime"}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
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
                  <span>Support Refuge financially</span>
                </li>
              </ul>

              <Link
                href={`/signin?plan=${supporterPlan}`}
                className="block w-full text-center pill-input bg-white hover:bg-grey transition-colors"
              >
                Get started
              </Link>
            </div>

            {/* Member */}
            <div className="border-2 border-black p-8 flex flex-col bg-black text-white">
              <h2 className="font-serif text-medium mb-2">Member</h2>
              <p className="text-large font-medium mb-1">
                €50<span className="text-small font-normal">/year</span>
              </p>
              <p className="text-small opacity-50 mb-8">Billed annually</p>

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2">
                  <span className="text-green">&#10003;</span>
                  <span>Everything in Supporter</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green">&#10003;</span>
                  <span>Member benefits coming soon</span>
                </li>
              </ul>

              <Link
                href="/signin?plan=member_annual"
                className="block w-full text-center pill-input bg-white text-black hover:bg-grey transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>

          <p className="text-center text-small mt-12 max-w-xl mx-auto">
            Already have an account?{" "}
            <Link href="/signin" className="underline hover:no-underline">
              Sign in
            </Link>
            .
          </p>
        </div>
      </section>
    </Layout>
  );
}
