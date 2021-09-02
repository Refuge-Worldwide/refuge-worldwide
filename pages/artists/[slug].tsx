import Layout from "../../components/layout";
import ArtistMeta from "../../components/seo/artist";
import { getArtistAndRelatedShows } from "../../lib/api";
import { getArtistPathsToPreRender } from "../../lib/api/paths";
import { ArtistEntry, ShowInterface } from "../../types/shared";
import ArtistBody from "../../views/artists/artistBody";
import RelatedShows from "../../views/artists/relatedShows";
import SinglePage from "../../views/singlePage";

type ArtistProps = {
  artist: ArtistEntry;
  preview: boolean;
  relatedShows?: ShowInterface[];
};

export default function Artist({ artist, relatedShows, preview }: ArtistProps) {
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

      {relatedShows.length > 0 && <RelatedShows shows={relatedShows} />}
    </Layout>
  );
}

export async function getStaticProps({ params, preview = false }) {
  try {
    const data = await getArtistAndRelatedShows(params.slug, preview);

    if (!data) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        preview,
        ...data,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      notFound: true,
    };
  }
}

export async function getStaticPaths() {
  return {
    paths: await getArtistPathsToPreRender(),
    fallback: "blocking",
  };
}
