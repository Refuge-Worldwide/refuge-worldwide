import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import ShowMeta from "../../components/seo/show";
import { getRadioPageSingle } from "../../lib/contentful/pages/radio";
import { getShowPathsToPreRender } from "../../lib/contentful/paths";
import RelatedShows from "../../views/artists/relatedShows";
import ShowBody from "../../views/radio/showBody";
import SinglePage from "../../views/singlePage";

export default function Show({
  show,
  relatedShows,
  preview,
}: InferGetStaticPropsType<typeof getStaticProps>) {
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
  return {
    props: { preview, ...(await getRadioPageSingle(params.slug, preview)) },
  };
}

export async function getStaticPaths() {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    return {
      paths: [],
      fallback: "blocking",
    };
  }

  const paths = await getShowPathsToPreRender();

  return { paths, fallback: "blocking" };
}
