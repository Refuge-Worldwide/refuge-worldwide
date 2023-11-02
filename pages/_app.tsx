import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { Fragment } from "react";
import Footer from "../components/footer";
import { LivePlayerLoading } from "../components/livePlayer";
import Navigation from "../components/navigation";
import useFathom from "../hooks/useFathom";
import JoinChat from "../components/join-chat";
import useSmoothscrollPolyfill from "../hooks/useSmoothscrollPolyfill";
import { useRouter } from "next/router";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { useState } from "react";
import "../styles/globals.css";
import MixedFeelingsPlayer from "../components/mixedFeelingsPlayer";

const MixcloudPlayer = dynamic(() => import("../components/mixcloudPlayer"), {
  ssr: false,
});

const LivePlayer = dynamic(() => import("../components/livePlayer"), {
  ssr: false,
  loading: LivePlayerLoading,
});

function RefugeApp({ Component, pageProps }: AppProps) {
  useSmoothscrollPolyfill();
  useFathom();
  const router = useRouter();
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  if ((Component as any).noLayout) return <Component {...pageProps} />;

  return (
    <Fragment>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <header>
          <Navigation />
        </header>

        <LivePlayer />

        <Component {...pageProps} />

        {router.pathname != "/admin/calendar" && <Footer />}

        <MixcloudPlayer />
        {router.pathname != "/admin/calendar" && <JoinChat />}
      </SessionContextProvider>
    </Fragment>
  );
}

export default RefugeApp;
