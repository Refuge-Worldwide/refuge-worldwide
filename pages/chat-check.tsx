import Head from "next/head";
import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "@/hooks/useChatPass";

type Turnstile = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
};

type NativeWindow = Window & {
  turnstile?: Turnstile;
  ReactNativeWebView?: { postMessage: (message: string) => void };
};

// The app only understands these messages, so the captcha behind this page
// can be swapped with a website deploy alone:
//   { type: "pass", pass }          - done, here's the chat pass
//   { type: "interactive", height } - show the WebView, the person needs to act
//   { type: "hidden" }              - hide it again
//   { type: "error", message }      - give up
function postToApp(message: Record<string, string | number>) {
  (window as NativeWindow).ReactNativeWebView?.postMessage(
    JSON.stringify(message)
  );
}

async function exchangeForPass(token: string) {
  try {
    const response = await fetch("/api/chat/pass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const body = await response.json().catch(() => null);
    if (response.ok && body?.pass) {
      postToApp({ type: "pass", pass: body.pass });
    } else {
      postToApp({ type: "error", message: body?.error ?? "" });
    }
  } catch {
    postToApp({ type: "error", message: "" });
  }
}

export default function ChatCheckPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      (window as NativeWindow).turnstile?.render(
        containerRef.current as HTMLElement,
        {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: "interaction-only",
          theme: "dark",
          callback: (token: string) => exchangeForPass(token),
          "error-callback": () => postToApp({ type: "error", message: "" }),
          "before-interactive-callback": () =>
            postToApp({ type: "interactive", height: 120 }),
        }
      );
    };
    script.onerror = () => postToApp({ type: "error", message: "" });
    document.head.appendChild(script);
  }, []);

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex items-center justify-center">
        <div ref={containerRef} />
      </div>
    </>
  );
}

ChatCheckPage.noLayout = true;
