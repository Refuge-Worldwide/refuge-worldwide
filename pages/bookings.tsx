import { useCallback, useState } from "react";
import BookingPasswordForm from "../components/bookingForm";
import CalendlyEmbed from "../components/calendly";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function BookingsPage() {
  // const [passwordCorrect, passwordCorrectSet] = useState(false);

  // const onPasswordCorrect = useCallback(() => {
  //   passwordCorrectSet(true);
  // }, []);

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
      <PageMeta title="Bookings | Refuge Worldwide" path="bookings/" />

      <section className="">
        <Cal
          className="pt-24 pb-4 min-h-[75vh]"
          calLink="refugeworldwide"
        ></Cal>
      </section>
    </Layout>
  );
}
