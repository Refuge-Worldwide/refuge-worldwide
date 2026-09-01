import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface DirectusUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export function useDirectusUser() {
  const [user, setUser] = useState<DirectusUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    function fetchUser() {
      setLoading(true);
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setUser(data.user ?? null);
        })
        .catch(() => {
          if (!cancelled) setUser(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    fetchUser();

    // Navigation and Footer are mounted once at the app-shell level (outside
    // <Component>, see _app.tsx) rather than per-page, so without this
    // they'd never notice a client-side sign-in/out and keep showing stale
    // logged-out UI (e.g. the footer's support banner) until a hard reload.
    router.events.on("routeChangeComplete", fetchUser);

    return () => {
      cancelled = true;
      router.events.off("routeChangeComplete", fetchUser);
    };
  }, [router.events]);

  return { user, loading };
}
