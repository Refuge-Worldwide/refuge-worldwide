import Head from "next/head";
import ArtistRow from "../../components/artistRow";
import Badge from "../../components/badge";
import Layout from "../../components/layout";
import Pill from "../../components/pill";
import { ALPHABET } from "../../constants";
import useArtistRoleFilter from "../../hooks/useArtistRoleFilter";
import { getAllArtists } from "../../lib/api";
import type { ArtistFilterType, ArtistInterface } from "../../types/shared";
import { sortAndGroup } from "../../util";

interface Page extends JSX.Element {
  allArtists: ArtistInterface[];
  preview: boolean;
}

export default function ArtistsPage({ allArtists, preview }: Page) {
  const filters: ArtistFilterType[] = ["All", "Residents", "Guests"];
  const { filter, filterSet } = useArtistRoleFilter<ArtistFilterType>("All");
  const sections = sortAndGroup(allArtists, filter);

  return (
    <Layout className="bg-purple md:flex flex-row-reverse" preview={preview}>
      <Head>
        <title>Artists</title>
      </Head>

      <div>
        <section className="p-4 sm:p-8">
          <Pill outline>
            <h1>Artists A-Z</h1>
          </Pill>

          <div className="h-8" />

          <ul className="w-full flex flex-wrap leading-none -mr-2 -mb-2">
            {filters.map((type, i) => (
              <li key={i} className="inline-flex pr-2 pb-2">
                <button
                  className="focus:outline-none focus:ring-4 rounded-full"
                  onClick={() => filterSet(type)}
                >
                  <Badge invert={filter === type} text={type} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {sections.map((section, i) => (
          <ArtistRow key={i} {...section} />
        ))}
      </div>

      <aside className="hidden md:block border-r-2 p-4">
        <ul className="text-small text-center sticky top-4">
          {ALPHABET.map((letter, i) => {
            const letterHasArtists =
              sections.filter((section) => section.alphabet === letter).length >
              0;

            if (letterHasArtists)
              return (
                <li key={i}>
                  <a className="text-black font-medium" href={`#${letter}`}>
                    <span>{letter}</span>
                  </a>
                </li>
              );

            return (
              <li key={i}>
                <span className="text-black text-opacity-25">{letter}</span>
              </li>
            );
          })}
        </ul>
      </aside>
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
