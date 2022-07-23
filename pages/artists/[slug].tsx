import Layout from "../../components/layout";
import ArtistMeta from "../../components/seo/artist";
import { getArtistsPageSingle } from "../../lib/contentful/pages/artists";
import { getArtistPathsToPreRender } from "../../lib/contentful/paths";
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
  const data = await getArtistsPageSingle(params.slug, preview);

  return {
    props: { preview, ...data },
    revalidate: 60 * 60,
  };
}

export async function getStaticPaths() {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    return {
      paths: [],
      fallback: "blocking",
    };
  }

  const paths = await getArtistPathsToPreRender();

  return { paths, fallback: "blocking" };
}
