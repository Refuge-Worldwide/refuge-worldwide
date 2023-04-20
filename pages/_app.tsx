import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { Fragment } from "react";
import Footer from "../components/footer";
import { LivePlayerLoading } from "../components/livePlayer";
import Navigation from "../components/navigation";
import useFathom from "../hooks/useFathom";
import useSmoothscrollPolyfill from "../hooks/useSmoothscrollPolyfill";
// import WidgetBotEmbed from "../components/discord";
import WidgetBotCrate from "../components/WidgetBotCrate";
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

  if ((Component as any).noLayout) return <Component {...pageProps} />;

  return (
    <Fragment>
      <header>
        <Navigation />
      </header>

      <LivePlayer />

      <Component {...pageProps} />

      <Footer />

      <MixcloudPlayer />

      <WidgetBotCrate
        server="1077626733458620487"
        channel="1077626735132164096"
        color="#000"
        glyph={["/images/chat.svg", "50%"]}
      />
    </Fragment>
  );
}

export default RefugeApp;
