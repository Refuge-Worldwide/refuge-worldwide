import Layout from "../../components/layout";
import ArtistMeta from "../../components/seo/artist";
import {
  getAllArtistPaths,
  getAllArtists,
  getArtistAndMoreShows,
} from "../../lib/api";
import { ArtistInterface, ShowInterface } from "../../types/shared";
import ArtistBody from "../../views/artists/artistBody";
import RelatedShows from "../../views/artists/relatedShows";
import SinglePage from "../../views/singlePage";

interface Page extends JSX.Element {
  artist: ArtistInterface;
  relatedShows?: ShowInterface[];
  preview: boolean;
}

export default function Artist({ artist, relatedShows, preview }: Page) {
  return (
    <Layout preview={preview}>
      <ArtistMeta {...artist} />

      <SinglePage
        coverImage={artist.photo}
        objectPosition={artist.coverImagePosition}
        withBackButton
      >
        <ArtistBody {...artist} />
      </SinglePage>

      {relatedShows?.length > 0 && <RelatedShows shows={relatedShows} />}
    </Layout>
  );
}

export async function getStaticProps({ params, preview = false }) {
  const data = await getArtistAndMoreShows(params.slug, preview);

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      preview,
      artist: data.artist,
      relatedShows: data?.relatedShows,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  return {
    paths: await getAllArtistPaths(),
    fallback: "blocking",
  };
}
