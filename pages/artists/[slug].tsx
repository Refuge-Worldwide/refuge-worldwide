import { useRouter } from "next/dist/client/router";
import ErrorPage from "next/error";
import Head from "next/head";
import Layout from "../../components/layout";
import SinglePage from "../../components/singlePage";
import { getAllArtists, getArtistAndMoreShows } from "../../lib/api";
import { ArtistInterface } from "../../types/shared";

interface Page extends JSX.Element {
  artist: ArtistInterface;
  preview: boolean;
}

export default function Artist({ artist, preview }: Page) {
  const router = useRouter();

  if (!router.isFallback && !artist) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout preview={preview}>
      {router.isFallback ? (
        <h1>Loading…</h1>
      ) : (
        <>
          <Head>
            <title>{artist.name} | Refuge Worldwide</title>
            <meta property="og:image" content={artist.photo.url} />
          </Head>

          <SinglePage coverImage={artist?.photo} withBackButton>
            <h1>{artist?.name}</h1>
          </SinglePage>
        </>
      )}
    </Layout>
  );
}

export async function getStaticProps({ params, preview = false }) {
  const data = await getArtistAndMoreShows(params.slug, preview);

  return {
    props: {
      preview,
      artist: data?.artist,
    },
  };
}

export async function getStaticPaths() {
  const allArtists = await getAllArtists(false);

  return {
    paths: allArtists?.map(({ slug }) => `/artists/${slug}`) ?? [],
    fallback: true,
  };
}
