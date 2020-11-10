import Head from "next/head";
import Layout from "../components/layout";
import SupportView from "../views/support";

export default function SupportPage() {
  return (
    <Layout>
      <Head>
        <title>Support</title>
      </Head>

      <SupportView />
    </Layout>
  );
}
