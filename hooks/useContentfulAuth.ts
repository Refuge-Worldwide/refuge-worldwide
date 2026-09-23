import { useEffect, useState } from "react";
import {
  clearStoredToken,
  cleanUrlHash,
  getStoredToken,
  parseCallbackHash,
  redirectToContentfulAuth,
  storeToken,
} from "../lib/contentful/oauth";

export type ContentfulAuthState =
  | { status: "loading" }
  | { status: "authenticated"; token: string }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

const clientId = process.env.NEXT_PUBLIC_CONTENTFUL_OAUTH_CLIENT_ID;

// Each staff member signs in with their own Contentful account; the token
// comes back in the URL hash and is kept in localStorage until it expires.
export function useContentfulAuth(): ContentfulAuthState & {
  logout: () => void;
} {
  const [state, setState] = useState<ContentfulAuthState>({
    status: "loading",
  });

  useEffect(() => {
    if (!clientId) {
      setState({
        status: "error",
        message: "NEXT_PUBLIC_CONTENTFUL_OAUTH_CLIENT_ID is not set",
      });
      return;
    }

    const parsed = parseCallbackHash(window.location.hash);
    if (parsed) {
      storeToken(parsed.accessToken, parsed.expiresIn);
      cleanUrlHash();
      setState({ status: "authenticated", token: parsed.accessToken });
      return;
    }

    const stored = getStoredToken();
    if (stored) {
      setState({ status: "authenticated", token: stored });
      return;
    }

    setState({ status: "unauthenticated" });
    redirectToContentfulAuth({ clientId });
  }, []);

  const logout = () => {
    clearStoredToken();
    setState({ status: "unauthenticated" });
    if (clientId) redirectToContentfulAuth({ clientId });
  };

  return { ...state, logout };
}
