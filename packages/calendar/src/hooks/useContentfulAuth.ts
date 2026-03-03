import { useState, useEffect } from "react";
import type { CalendarConfig } from "../config";
import {
  getStoredToken,
  parseCallbackHash,
  storeToken,
  clearStoredToken,
  cleanUrlHash,
  redirectToContentfulAuth,
  getTokenTTL,
} from "../lib/oauth";

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; token: string; expiresInSeconds: number }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

/**
 * Manages Contentful OAuth authentication for the calendar.
 *
 * On mount, this hook:
 * 1. Checks the URL hash for a freshly returned OAuth token (#access_token=...)
 * 2. Falls back to a stored token in localStorage
 * 3. If neither is found (or both are expired), redirects to Contentful's login
 *
 * Returns the current auth state and a logout function.
 *
 * @example
 * ```tsx
 * const auth = useContentfulAuth(config);
 * if (auth.status === 'loading') return <Loading />;
 * if (auth.status !== 'authenticated') return null; // redirect already triggered
 *
 * const client = createClient({ accessToken: auth.token });
 * ```
 */
export function useContentfulAuth(
  config: CalendarConfig
): AuthState & { logout: () => void } {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const oauthConfig = config.auth?.contentfulOAuth;

    // If no OAuth config, fall through to management token mode
    if (!oauthConfig) {
      if (config.contentful.managementToken) {
        setState({
          status: "authenticated",
          token: config.contentful.managementToken,
          expiresInSeconds: Infinity,
        });
      } else {
        setState({
          status: "error",
          message:
            "No auth configured. Set auth.contentfulOAuth in your CalendarConfig or provide contentful.managementToken.",
        });
      }
      return;
    }

    // 1. Check URL hash for a freshly returned OAuth token
    const parsed = parseCallbackHash(window.location.hash);
    if (parsed) {
      storeToken(parsed.accessToken, parsed.expiresIn);
      cleanUrlHash();
      setState({
        status: "authenticated",
        token: parsed.accessToken,
        expiresInSeconds: parsed.expiresIn,
      });
      return;
    }

    // 2. Check localStorage for a previously stored (non-expired) token
    const stored = getStoredToken();
    if (stored) {
      setState({
        status: "authenticated",
        token: stored,
        expiresInSeconds: getTokenTTL(),
      });
      return;
    }

    // 3. No valid token — redirect to Contentful OAuth
    // Set state to unauthenticated briefly before redirect so any loading UI
    // can settle, then redirect on next tick
    setState({ status: "unauthenticated" });
    const timeout = setTimeout(() => {
      redirectToContentfulAuth(oauthConfig);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  const logout = () => {
    clearStoredToken();
    setState({ status: "unauthenticated" });

    // Redirect back to Contentful auth after logout
    const oauthConfig = config.auth?.contentfulOAuth;
    if (oauthConfig) {
      redirectToContentfulAuth(oauthConfig);
    }
  };

  return { ...state, logout };
}
