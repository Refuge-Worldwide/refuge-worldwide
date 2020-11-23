import type { AppProps } from "next/app";
import Footer from "../components/footer";
import Meta from "../components/meta";
// import MixcloudPlayer from "../components/mixcloudPlayer";
import Navigation from "../components/navigation";
// import Player from "../components/player";
import "../styles/globals.css";

function RefugeApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Meta />

      <header>
        <Navigation />
      </header>

      {/* <Player /> */}

      <Component {...pageProps} />

      <Footer />

      {/* <MixcloudPlayer mini /> */}
    </>
  );
}

export default RefugeApp;
