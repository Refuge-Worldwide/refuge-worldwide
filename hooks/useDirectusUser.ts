import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface DirectusUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

type MeResponse = {
  user: DirectusUser | null;
  isStaff: boolean;
  hasSupporterAccess: boolean;
};

let inflight: Promise<MeResponse> | null = null;

async function requestMe(canRetry: boolean): Promise<MeResponse> {
  const data = await fetch("/api/auth/me").then((res) => res.json());
  if (!data.user && data.retry && canRetry) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return requestMe(false);
  }
  return {
    user: data.user ?? null,
    isStaff: data.isStaff === true,
    hasSupporterAccess: data.hasSupporterAccess === true,
  };
}

function fetchMe(): Promise<MeResponse> {
  inflight ??= requestMe(true).finally(() => {
    inflight = null;
  });
  return inflight;
}

export function useDirectusUser() {
  const [user, setUser] = useState<DirectusUser | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [hasSupporterAccess, setHasSupporterAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    // Only the very first fetch should show as "loading" — later ones are
    // background revalidation on route change (see below) and already have
    // valid `user` data to keep showing meanwhile. Without this, a consumer
    // that gates its UI on `loading` (e.g. chatRoom.tsx) would blank out on
    // every single navigation, since `loading` briefly flips true → false
    // each time.
    let isFirstFetch = true;

    function fetchUser() {
      if (isFirstFetch) setLoading(true);
      fetchMe()
        .then((data) => {
          if (cancelled) return;
          setUser(data.user);
          setIsStaff(data.isStaff);
          setHasSupporterAccess(data.hasSupporterAccess);
        })
        .catch(() => {
          if (cancelled) return;
          setUser(null);
          setIsStaff(false);
          setHasSupporterAccess(false);
        })
        .finally(() => {
          if (!cancelled && isFirstFetch) setLoading(false);
          isFirstFetch = false;
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

  return {
    user,
    loading,
    isStaff,
    hasSupporterAccess,
  };
}
