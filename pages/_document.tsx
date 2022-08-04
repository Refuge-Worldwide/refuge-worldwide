import Document, { Head, Html, Main, NextScript } from "next/document";

class RefugeDocument extends Document {
  render() {
    return (
      <Html lang="en" className="antialiased text-[calc(1rem*0.8)]">
        <Head>
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            href="/fonts/visuelt-light.woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            href="/fonts/visuelt-medium.woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            as="image"
            href="/images/navigation-smile-white.svg"
          />
          <link rel="stylesheet" href="https://use.typekit.net/rqu7mun.css" />
          <link rel="preconnect" href="https://images.ctfassets.net" />
          <link rel="dns-prefetch" href="https://images.ctfassets.net" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <link
            href="/rss"
            type="application/rss+xml"
            rel="alternate"
            title="Refuge Worldwide News"
          />
          <meta name="msapplication-TileColor" content="#000000" />
          <meta name="theme-color" content="#000000" />
          <meta property="og:site_name" content="Refuge Worldwide" />
        </Head>

        <body className="text-small sm:text-base font-light">
          <Main />

          <NextScript />
        </body>
      </Html>
    );
  }
}

export default RefugeDocument;
