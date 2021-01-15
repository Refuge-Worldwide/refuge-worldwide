import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { Fragment } from "react";
import Footer from "../components/footer";
import { LivePlayerLoading } from "../components/livePlayer";
import Navigation from "../components/navigation";
import useSmoothscrollPolyfill from "../hooks/useSmoothscrollPolyfill";
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

  return (
    <Fragment>
      <header>
        <Navigation />
      </header>

      <LivePlayer />

      <Component {...pageProps} />

      <Footer />

      <MixcloudPlayer />
    </Fragment>
  );
}

export default RefugeApp;
