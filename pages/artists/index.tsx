import Head from "next/head";
import ArtistRow from "../../components/artistRow";
import Layout from "../../components/layout";
import { getAllArtists } from "../../lib/api";
import type { ArtistInterface } from "../../types/shared";
import { sortAndGroup } from "../../util";

interface Page extends JSX.Element {
  allArtists: ArtistInterface[];
  preview: boolean;
}

export default function ArtistsPage({ allArtists, preview }: Page) {
  const sections = sortAndGroup(allArtists);

  return (
    <Layout className="bg-purple" preview={preview}>
      <Head>
        <title>Artists</title>
      </Head>

      <h1 hidden>Artists</h1>

      {sections.map((section, i) => (
        <ArtistRow key={i} {...section} />
      ))}
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  const allArtists = await getAllArtists(preview);

  return {
    props: {
      preview,
      allArtists,
    },
    revalidate: 60,
  };
}
