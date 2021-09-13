import Layout from "../../components/layout";
import ShowMeta from "../../components/seo/show";
import { getShowAndMoreShows } from "../../lib/contentful";
import { getShowPathsToPreRender } from "../../lib/contentful/paths";
import { ShowInterface } from "../../types/shared";
import RelatedShows from "../../views/artists/relatedShows";
import ShowBody from "../../views/radio/showBody";
import SinglePage from "../../views/singlePage";

type Props = {
  show: ShowInterface;
  relatedShows?: ShowInterface[];
  preview: boolean;
};

export default function Show({ show, relatedShows, preview }: Props) {
  return (
    <Layout preview={preview}>
      <ShowMeta {...show} />

      <SinglePage
        coverImage={show.coverImage}
        objectPosition={show.coverImagePosition}
        withBackButton
      >
        <ShowBody {...show} />
      </SinglePage>

      {relatedShows?.length > 0 && (
        <RelatedShows title="More Episodes" shows={relatedShows} />
      )}
    </Layout>
  );
}

export async function getStaticProps({ params, preview = false }) {
  try {
    const data = await getShowAndMoreShows(params.slug, preview);

    return {
      props: { preview, ...data },
      revalidate: 60 * 60,
    };
  } catch (error) {
    console.error(error);

    return {
      notFound: true,
    };
  }
}

export async function getStaticPaths() {
  const paths = await getShowPathsToPreRender();

  return { paths, fallback: "blocking" };
}
