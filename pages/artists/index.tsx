import { InferGetStaticPropsType } from "next";
import ArtistRow from "../../components/artistRow";
import Badge from "../../components/badge";
import Layout from "../../components/layout";
import Pill from "../../components/pill";
import PageMeta from "../../components/seo/page";
import { ALPHABET } from "../../constants";
import useArtistRoleFilter from "../../hooks/useArtistRoleFilter";
import { getArtistsPage } from "../../lib/contentful/pages";
import type { ArtistFilterType } from "../../types/shared";
import { sortAndGroup } from "../../util";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      allArtists: await getArtistsPage(),
    },
    revalidate: 60,
  };
}

export default function ArtistsPage({
  preview,
  allArtists,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const filters: ArtistFilterType[] = ["All", "Residents", "Guests"];
  const { filter, filterSet } = useArtistRoleFilter("All");
  const sections = sortAndGroup(allArtists, filter);

  return (
    <Layout
      preview={preview}
      className="bg-purple flex flex-col-reverse sm:flex-row-reverse"
    >
      <PageMeta title="Artists | Refuge Worldwide" path="artists/" />

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

      <aside className="border-b-2 sm:border-b-0 sm:border-r-2">
        <ul className="sm:sticky sm:top-16 p-4 overflow-scroll hide-scrollbar flex sm:block space-x-4 sm:space-x-0 text-small text-center whitespace-nowrap">
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

          <li>&nbsp;</li>
        </ul>
      </aside>
    </Layout>
  );
}
