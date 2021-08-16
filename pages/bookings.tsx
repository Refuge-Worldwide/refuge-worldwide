import { FormEvent, Fragment, useCallback, useEffect, useState } from "react";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import useScript from "../hooks/useScript";
import { Arrow } from "../icons/arrow";
import { getBookingsPage } from "../lib/api";
import type { BookingsPageData } from "../types/shared";

type Props = {
  preview: boolean;
  data: BookingsPageData;
};

function BookingPasswordForm({
  bookingPassword,
  onPasswordCorrect,
}: {
  bookingPassword: string;
  onPasswordCorrect: () => void;
}) {
  const [message, setMessage] = useState<string>();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const target = event.target as typeof event.target & {
        password: { value: string };
      };

      if (target.password.value === bookingPassword) {
        onPasswordCorrect();

        return;
      }

      throw new Error("Incorrect Password");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <form method="POST" onSubmit={onSubmit}>
        <div>
          <div>
            <label className="block font-medium" htmlFor="password">
              Enter your password
            </label>

            <div className="h-5" />

            <input
              autoComplete="off"
              className="pill-input"
              id="password"
              name="password"
              placeholder="Password"
              required
              type="password"
              allow-1password="no"
            />
          </div>

          <div className="h-5" />

          <div>
            <button
              type="submit"
              className="inline-flex items-center space-x-4 text-base font-medium"
            >
              <span className="underline">Submit</span>
              <Arrow />
            </button>
          </div>
        </div>
      </form>

      {message && (
        <Fragment>
          <div className="h-5" />

          <div className="text-small text-red">{message}</div>
        </Fragment>
      )}
    </div>
  );
}

function CalendlyEmbed({ shouldInit }: { shouldInit: boolean }) {
  const scriptStatus = useScript(
    "//assets.calendly.com/assets/external/widget.js"
  );

  useEffect(() => {
    if (shouldInit === false || scriptStatus !== "ready") {
      return;
    }

    (window as any).Calendly.initInlineWidget({
      url: "https://calendly.com/studio-booking-refuge-worldwide/booking",
      parentElement: document.getElementById("calendly-embed"),
      prefill: {},
      utm: {},
    });
  }, [scriptStatus, shouldInit]);

  return <div id="calendly-embed" className="h-screen" />;
}

function BookingsPage({ preview, data }: Props) {
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
              bookingPassword={data.bookingPassword}
              onPasswordCorrect={onPasswordCorrect}
            />
          </div>
        </section>
      )}
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      data: await getBookingsPage(preview),
    },
  };
}

export default BookingsPage;
