import { InferGetStaticPropsType } from "next";
import Link from "next/link";
import GuestRow from "../../components/guestRow";
import Badge from "../../components/badge";
import Layout from "../../components/layout";
import Pill from "../../components/pill";
import PageMeta from "../../components/seo/page";
import { getArtistsPage } from "../../lib/contentful/pages/artists";
import { ALPHABET } from "../../constants";
import { sortAndGroup } from "../../util";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      guests: await getArtistsPage(false, 1000, 0),
      guestsTwo: await getArtistsPage(false, 1000, 1000),
      guestsThree: await getArtistsPage(false, 1000, 2000),
    },
  };
}

export default function GuestsPage({
  preview,
  guests,
  guestsTwo,
  guestsThree,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const allGuests = guests.concat(guestsTwo, guestsThree);
  const sections = sortAndGroup(allGuests);

  return (
    <Layout
      preview={preview}
      className="bg-purple flex flex-col-reverse sm:flex-row-reverse"
    >
      <PageMeta title="Guests | Refuge Worldwide" path="guests/" />

      <div>
        <section className="p-4 sm:p-8">
          <Pill outline>
            <h1>Artists A-Z</h1>
          </Pill>

          <div className="h-8" />

          <ul className="w-full flex flex-wrap leading-none gap-2">
            <Link
              href="/artists"
              className="focus:outline-none focus:ring-4 rounded-full"
            >
              <Badge text={"Residents"} />
            </Link>

            <Link
              href="/artists/guests"
              className="focus:outline-none focus:ring-4 rounded-full"
            >
              <Badge invert text={"Guests"} />
            </Link>
          </ul>
        </section>

        {sections.map((section, i) => (
          <GuestRow key={i} {...section} />
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
                <span className="text-black/25">{letter}</span>
              </li>
            );
          })}

          <li>&nbsp;</li>
        </ul>
      </aside>
    </Layout>
  );
}
