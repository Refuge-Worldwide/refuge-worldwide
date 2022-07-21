import { useCallback, useState } from "react";
import BookingPasswordForm from "../components/bookingForm";
import CalendlyEmbed from "../components/calendly";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";

export default function BookingsPage() {
  const [passwordCorrect, passwordCorrectSet] = useState(false);

  const onPasswordCorrect = useCallback(() => {
    passwordCorrectSet(true);
  }, []);

  return (
    <Layout>
      <PageMeta title="Bookings | Refuge Worldwide" path="bookings/" />

      {passwordCorrect ? (
        <section>
          <CalendlyEmbed shouldInit={passwordCorrect} />
        </section>
      ) : (
        <section className="py-48 md:py-72">
          <div className="container-md p-4 sm:p-8">
            <BookingPasswordForm onPasswordCorrect={onPasswordCorrect} />
          </div>
        </section>
      )}
    </Layout>
  );
}
