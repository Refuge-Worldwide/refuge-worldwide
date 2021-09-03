import { InferGetStaticPropsType } from "next";
import { useCallback, useState } from "react";
import BookingPasswordForm from "../components/bookingForm";
import CalendlyEmbed from "../components/calendly";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import { getBookingsPage } from "../lib/api/pages";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getBookingsPage(preview)),
    },
    revalidate: 60,
  };
}

export default function BookingsPage({
  preview,
  bookingPassword,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [passwordCorrect, passwordCorrectSet] = useState(false);

  const onPasswordCorrect = useCallback(() => {
    passwordCorrectSet(true);
  }, []);

  return (
    <Layout preview={preview}>
      <PageMeta title="Bookings | Refuge Worldwide" path="bookings/" />

      {passwordCorrect ? (
        <section>
          <CalendlyEmbed shouldInit={passwordCorrect} />
        </section>
      ) : (
        <section className="py-48 md:py-72">
          <div className="container-md p-4 sm:p-8">
            <BookingPasswordForm
              bookingPassword={bookingPassword}
              onPasswordCorrect={onPasswordCorrect}
            />
          </div>
        </section>
      )}
    </Layout>
  );
}
