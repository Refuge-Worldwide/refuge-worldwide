import Head from "next/head";
import ArtistRow from "../../components/artistRow";
import Badge from "../../components/badge";
import Layout from "../../components/layout";
import Pill from "../../components/pill";
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

      <section className="p-4 sm:p-8 border-t-2">
        <Pill outline>
          <h1>Artists A-Z</h1>
        </Pill>

        <div className="h-8" />

        <ul className="w-full flex flex-wrap leading-none -mr-2 -mb-2">
          <li className="inline-flex pr-2 pb-2">
            <button className="focus:outline-none focus:ring-4 rounded-full">
              <Badge invert={true} text={"All"} />
            </button>
          </li>

          <li className="inline-flex pr-2 pb-2">
            <button className="focus:outline-none focus:ring-4 rounded-full">
              <Badge invert={false} text={"Residents"} />
            </button>
          </li>
          <li className="inline-flex pr-2 pb-2">
            <button className="focus:outline-none focus:ring-4 rounded-full">
              <Badge invert={false} text={"Guests"} />
            </button>
          </li>
        </ul>
      </section>

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
