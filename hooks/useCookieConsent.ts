import Cookies from "js-cookie";

const USER_CONSENT_COOKIE_KEY = "cookie_consent";

export default function useCookieConsent() {
  const consent = Cookies.get(USER_CONSENT_COOKIE_KEY) ? true : false;

  return consent;
}
