import { useEffect, useState } from "react";

interface DirectusUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export function useDirectusUser() {
  const [user, setUser] = useState<DirectusUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

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

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
