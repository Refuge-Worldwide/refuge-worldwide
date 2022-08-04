import { InferGetStaticPropsType } from "next";
import Image from "next/future/image";
import Link from "next/link";
import ArtistPreview from "../../components/artistPreview";
import Badge from "../../components/badge";
import Layout from "../../components/layout";
import Pill from "../../components/pill";
import PageMeta from "../../components/seo/page";
import useArtistsGuests from "../../hooks/useArtistsGuests";
import {
  ARTISTS_GUESTS_PAGE_SIZE,
  getArtistsPage,
} from "../../lib/contentful/pages/artists";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      guests: await getArtistsPage(false, ARTISTS_GUESTS_PAGE_SIZE, 0),
    },
  };
}

export default function GuestsPage({
  preview,
  guests: fallbackData,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { guests, loadMore, isReachingEnd } = useArtistsGuests(fallbackData);

  return (
    <Layout preview={preview} className="bg-purple">
      <PageMeta title="Guests | Refuge Worldwide" path="artists/guests/" />

      <section className="p-4 sm:p-8">
        <Pill outline>
          <h1>Artists A-Z</h1>
        </Pill>

        <div className="h-8" />

        <ul className="w-full flex flex-wrap leading-none gap-2">
          <Link href="/artists">
            <a className="focus:outline-none focus:ring-4 rounded-full">
              <Badge text={"Residents"} />
            </a>
          </Link>

          <Link href="/artists/guests">
            <a className="focus:outline-none focus:ring-4 rounded-full">
              <Badge invert text={"Guests"} />
            </a>
          </Link>
        </ul>
      </section>

      <section className="border-t-2 border-black">
        <div className="p-4 md:p-8">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-6 sm:gap-8">
            {guests.map((artist, i) => (
              <li key={i}>
                <ArtistPreview
                  name={artist.name}
                  slug={artist.slug}
                  src={artist.photo.url}
                />
              </li>
            ))}
          </ul>

          {!isReachingEnd && (
            <div className="flex justify-center mt-10 sm:mt-8">
              <button
                onClick={loadMore}
                className="inline-flex focus:outline-none rounded-full items-center justify-center group"
                aria-label="Load more shows"
              >
                <Image
                  src="/images/load-more-button.svg"
                  unoptimized
                  aria-hidden
                  width={128}
                  height={128}
                  priority
                  alt=""
                />

                <span
                  className="absolute rounded-full h-20 w-20 group-focus:ring-4"
                  aria-hidden
                />
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
