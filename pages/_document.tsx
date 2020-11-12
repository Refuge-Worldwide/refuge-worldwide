import Document, { Html, Head, Main, NextScript } from "next/document";

class RefugeDocument extends Document {
  render() {
    return (
      <Html lang="en" className="antialiased">
        <Head />
        <body className="text-3xl">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default RefugeDocument;
