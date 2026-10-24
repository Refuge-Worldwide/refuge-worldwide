import { useCallback, useEffect, useRef } from "react";

type Turnstile = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

// public by design, the secret key lives in TURNSTILE_SECRET_KEY
export const TURNSTILE_SITE_KEY = "0x4AAAAAAFjmyz3r_kPm2pZI";

const TURNSTILE_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = TURNSTILE_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Couldn't load the human check — please try again."));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

// Turnstile only loads here, for anonymous chatters, never anywhere else on the site
export function useChatPass(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const passRef = useRef<string | null>(null);
  const pendingRef = useRef<Promise<string> | null>(null);
  const waitingRef = useRef<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const requestToken = useCallback(async (): Promise<string> => {
    await loadTurnstile();
    const turnstile = window.turnstile as Turnstile;
    const setVisible = (visible: boolean) => {
      if (containerRef.current) {
        containerRef.current.style.display = visible ? "" : "none";
      }
    };
    return new Promise((resolve, reject) => {
      waitingRef.current = { resolve, reject };
      if (widgetIdRef.current) {
        turnstile.reset(widgetIdRef.current);
        return;
      }
      widgetIdRef.current = turnstile.render(
        containerRef.current as HTMLElement,
        {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: "interaction-only",
          theme: "dark",
          callback: (token: string) => {
            setVisible(false);
            waitingRef.current?.resolve(token);
          },
          "error-callback": () =>
            waitingRef.current?.reject(
              new Error("Couldn't verify you're human — please try again.")
            ),
          "before-interactive-callback": () => setVisible(true),
          "after-interactive-callback": () => setVisible(false),
        }
      );
    });
  }, []);

  const getPass = useCallback((): Promise<string> => {
    if (passRef.current) return Promise.resolve(passRef.current);
    if (!pendingRef.current) {
      pendingRef.current = (async () => {
        const token = await requestToken();
        const response = await fetch("/api/chat/pass", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const body = await response.json().catch(() => null);
        if (!response.ok || !body?.pass) {
          throw new Error(
            body?.error ?? "Couldn't verify you're human — please try again."
          );
        }
        passRef.current = body.pass as string;
        return passRef.current;
      })().finally(() => {
        pendingRef.current = null;
      });
    }
    return pendingRef.current;
  }, [requestToken]);

  const clearPass = useCallback(() => {
    passRef.current = null;
  }, []);

  // get one ready in the background so the first message sends straight away
  useEffect(() => {
    if (enabled) getPass().catch(() => {});
  }, [enabled, getPass]);

  useEffect(
    () => () => {
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current);
    },
    []
  );

  return { containerRef, getPass, clearPass };
}
