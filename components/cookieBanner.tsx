import { useEffect, useState } from "react";
import Link from "next/link";
import { AiOutlineInfoCircle } from "react-icons/ai";
import Cookies from "js-cookie";

const USER_CONSENT_COOKIE_KEY = "cookie_consent";
const USER_CONSENT_COOKIE_EXPIRE_DATE =
  new Date().getTime() + 365 * 24 * 60 * 60;

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = Cookies.get(USER_CONSENT_COOKIE_KEY) ? true : false;
    setShowBanner(!consent);
  }, []);

  if (!showBanner) {
    return null;
  }

  const acceptCookies = () => {
    console.log("cookies accepted");
    Cookies.set(USER_CONSENT_COOKIE_KEY, "true", {
      expires: USER_CONSENT_COOKIE_EXPIRE_DATE,
    });
    setShowBanner(false);
  };

  const declineCookies = () => {
    setShowBanner(false);
  };

  return (
    <section aria-labelledby="cookie-heading">
      <div className="flex justify-between items-center bg-black border-t border-white fixed bottom-0 w-screen z-50 p-4 sm:p-8 text-white">
        <div className="flex items-center gap-4">
          <AiOutlineInfoCircle />
          <h2 className="font-sans" id="cookie-heading">
            We use cookies.{" "}
            <Link href="/privacy-policy" className="underline">
              Read more.
            </Link>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={acceptCookies}
            className="rounded-full border border-white text-base px-4 py-2"
          >
            Accept <span className="sr-only">cookies</span>
          </button>
          <button
            type="button"
            onClick={declineCookies}
            className="rounded-full border border-white text-base px-4 py-2"
          >
            Reject <span className="sr-only">cookies</span>
          </button>
        </div>
      </div>
    </section>
  );
}
