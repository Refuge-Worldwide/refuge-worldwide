import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { Fragment } from "react";
import Footer from "../components/footer";
import { LivePlayerLoading } from "../components/livePlayer";
import Navigation from "../components/navigation";
import useFathom from "../hooks/useFathom";
import JoinChat from "../components/join-chat";
import useSmoothscrollPolyfill from "../hooks/useSmoothscrollPolyfill";
import "../styles/globals.css";
import MixedFeelingsPlayer from "../components/mixed-feelings-player";

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

  if ((Component as any).noLayout) return <Component {...pageProps} />;

  return (
    <Fragment>
      <header>
        <Navigation />
      </header>

      <LivePlayer />
      <MixedFeelingsPlayer />

      <Component {...pageProps} />

      <Footer />

      <MixcloudPlayer />
      {/* <JoinChat /> */}
    </Fragment>
  );
}

export default RefugeApp;
