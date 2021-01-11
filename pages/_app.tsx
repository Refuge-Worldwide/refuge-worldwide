import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Footer from "../components/footer";
import { LivePlayerLoading } from "../components/livePlayer";
import Meta from "../components/meta";
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
    <>
      <Meta />

      <header>
        <Navigation />
      </header>

      <LivePlayer />

      <Component {...pageProps} />

      <Footer />

      <MixcloudPlayer />
    </>
  );
}

export default RefugeApp;
