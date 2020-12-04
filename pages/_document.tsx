import Document, { Html, Head, Main, NextScript } from "next/document";

class RefugeDocument extends Document {
  render() {
    return (
      <Html lang="en" className="antialiased">
        <Head>
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
