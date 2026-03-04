import { useState, useEffect, useCallback } from "react";
import type { CalendarConfig } from "../config";
import {
  getStoredToken,
  clearStoredToken,
  redirectToContentfulAuth,
} from "../lib/oauth";

export interface CalendarAuthStatus {
  /**
   * False on the server and on the first client render (before localStorage is read).
   * Wait for `isReady` before rendering auth-gated UI to avoid a flash.
   */
  isReady: boolean;
  /** True if there is a valid Contentful session (OAuth token or management token). */
  isAuthenticated: boolean;
  /**
   * Clears the stored token and redirects to Contentful OAuth login
   * (OAuth mode) or sets isAuthenticated to false (management token mode).
   */
  logout: () => void;
}

/**
 * Lightweight auth status hook — use this on nav menus, non-calendar pages,
 * or anywhere you need to know whether the user has an active Contentful session
 * **without** triggering an automatic redirect.
 *
 * For the calendar widget itself (which handles the full OAuth redirect flow),
 * use `useContentfulAuth` instead.
 *
 * @example
 * ```tsx
 * import { useCalendarAuth } from '@refuge-worldwide/calendar';
 * import config from '../contentful-calendar.config';
 *
 * export function AdminNav() {
 *   const { isReady, isAuthenticated, logout } = useCalendarAuth(config);
 *   if (!isReady) return null;
 *   return isAuthenticated ? (
 *     <>
 *       <a href="/admin/calendar">Calendar</a>
 *       <button onClick={logout}>Sign out</button>
 *     </>
 *   ) : (
 *     <a href="/admin/calendar">Admin sign in</a>
 *   );
 * }
 * ```
 */
export function useCalendarAuth(config: CalendarConfig): CalendarAuthStatus {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const oauthConfig = config.auth?.contentfulOAuth;
    if (!oauthConfig) {
      // Management token mode: auth is implicit (middleware/env var protects the page).
      // Treat as always authenticated on the client.
      setIsAuthenticated(Boolean(config.contentful.managementToken));
    } else {
      setIsAuthenticated(Boolean(getStoredToken()));
    }
    setIsReady(true);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setIsAuthenticated(false);
    const oauthConfig = config.auth?.contentfulOAuth;
    if (oauthConfig) {
      redirectToContentfulAuth(oauthConfig);
    }
  }, []);

  return { isReady, isAuthenticated, logout };
}
