import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import Head from "next/head";

export default function BookingsPage() {
  useEffect(() => {
    (async function () {
      const Cal = await getCalApi();
      Cal("ui", {
        theme: "light",
        hideEventTypeDetails: false,
      });
    })();
  }, []);

  return (
    <Layout>
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <PageMeta
        title="Studio Bookings | Refuge Worldwide"
        path="studio-bookings/"
      />
      <section>
        <h1 className="font-serif pt-16 text-center text-large font-bold">
          Studio Bookings
        </h1>
        <Cal
          className="pt-12 pb-4 min-h-[75vh]"
          calLink="refugeworldwide"
        ></Cal>
      </section>
    </Layout>
  );
}
