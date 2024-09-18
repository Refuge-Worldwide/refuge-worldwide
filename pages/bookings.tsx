import { useCallback, useState } from "react";
import BookingPasswordForm from "../components/bookingForm";
import CalendlyEmbed from "../components/calendly";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import Head from "next/head";
import { Arrow } from "../icons/arrow";
import SinglePage from "../views/singlePage";
import Link from "next/link";

export default function BookingsPage() {
  return (
    <Layout>
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <PageMeta
        title="Studio Bookings | Refuge Worldwide"
        path="studio-bookings/"
      />
      <section className="py-48 md:py-72">
        <div className="container-md p-4 sm:p-8">
          <h1 className="text-large text-center mb-12">Bookings</h1>
          <ul className="flex flex-col gap-y-4 text-center">
            <li>
              <Link
                className="inline-flex items-center space-x-5 font-medium leading-none "
                href="/studio-bookings"
              >
                <span className="underline">DJ Practise Session</span>
                <Arrow />
              </Link>
            </li>
            <li>
              <Link
                className="inline-flex items-center space-x-5 font-medium leading-none "
                href="/studio-bookings"
              >
                <span className="underline">Production Studio Session</span>
                <Arrow />
              </Link>
            </li>
            <li>
              <Link
                className="inline-flex items-center space-x-5 font-medium leading-none "
                href="/nm1/bookings"
              >
                <span className="underline">NM1 Event Proposal</span>
                <Arrow />
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </Layout>
  );
}
