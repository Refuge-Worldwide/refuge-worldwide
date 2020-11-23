import Head from "next/head";
import Layout from "../components/layout";
import HomeView from "../views/home";

export default function HomePage() {
  return (
    <Layout>
      <Head>
        <title>Refuge Worldwide</title>
      </Head>

      <HomeView />
    </Layout>
  );
}
