import type { AppProps } from "next/app";
import Footer from "../components/footer";
import Meta from "../components/meta";
import Navigation from "../components/navigation";
import useMixcloudFooterWidget from "../hooks/useMixcloudFooterWidget";
// import Player from "../components/player";
import "../styles/globals.css";

function RefugeApp({ Component, pageProps }: AppProps) {
  useMixcloudFooterWidget();

  return (
    <>
      <Meta />

      <header>
        <Navigation />
      </header>

      {/* <Player /> */}

      <Component {...pageProps} />

      <Footer />
    </>
  );
}

export default RefugeApp;
