import Document, { Html, Head, Main, NextScript } from "next/document";

class RefugeDocument extends Document {
  render() {
    return (
      <Html lang="en" className="antialiased">
        <Head>
          <link rel="dns-prefetch" href="https://use.typekit.net/" />
          <link
            rel="preload"
            href="https://use.typekit.net/rqu7mun.css"
            as="style"
          />

          <link rel="stylesheet" href="https://use.typekit.net/rqu7mun.css" />
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
