import Head from "next/head";
import Layout from "../components/layout";
import NewsletterView from "../views/newsletter";

export default function NewsletterPage() {
  return (
    <Layout>
      <Head>
        <title>Newsletter</title>
      </Head>

      <NewsletterView />
    </Layout>
  );
}
