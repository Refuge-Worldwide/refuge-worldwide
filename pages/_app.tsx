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
import "../styles/globals.css";

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

  if ((Component as any).noLayout) return <Component {...pageProps} />;

  return (
    <Fragment>
      <header>
        <Navigation />
      </header>

      <LivePlayer />

      <Component {...pageProps} />

      {router.pathname != "/calendar" && <Footer />}

      <MixcloudPlayer />
      <JoinChat />
    </Fragment>
  );
}

export default RefugeApp;
