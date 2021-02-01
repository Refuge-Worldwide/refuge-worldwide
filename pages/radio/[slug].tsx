import { useRouter } from "next/dist/client/router";
import ErrorPage from "next/error";
import Layout from "../../components/layout";
import ShowMeta from "../../components/seo/show";
import { getAllShows, getShowAndMoreShows } from "../../lib/api";
import { ShowInterface } from "../../types/shared";
import RelatedShows from "../../views/artists/relatedShows";
import Loading from "../../views/loading";
import ShowBody from "../../views/radio/showBody";
import SinglePage from "../../views/singlePage";

type Props = {
  show: ShowInterface;
  relatedShows?: ShowInterface[];
  preview: boolean;
};

export default function Show({ show, relatedShows, preview }: Props) {
  const router = useRouter();

  if (!router.isFallback && !show) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout preview={preview}>
      {router.isFallback ? (
        <Loading />
      ) : (
        <>
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
        </>
      )}
    </Layout>
  );
}

export async function getStaticProps({ params, preview = false }) {
  const data = await getShowAndMoreShows(params.slug, preview);

  return {
    props: {
      preview,
      show: data?.show,
      relatedShows: data?.relatedShows,
    },
  };
}

export async function getStaticPaths() {
  const allShows = await getAllShows(false);

  return {
    paths:
      allShows
        ?.filter((show) => typeof show.slug === "string")
        ?.map(({ slug }) => `/radio/${slug}`) ?? [],
    fallback: true,
  };
}
