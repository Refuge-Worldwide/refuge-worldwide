import type { AppProps } from "next/app";
import "../styles/globals.css";

function RefugeApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default RefugeApp;
