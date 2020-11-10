import Head from "next/head";
import Layout from "../components/layout";
import AboutView from "../views/about";

export default function AboutPage() {
  return (
    <Layout>
      <Head>
        <title>About</title>
      </Head>

      <AboutView />
    </Layout>
  );
}
