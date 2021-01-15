import { useRouter } from "next/dist/client/router";
import ErrorPage from "next/error";
import Layout from "../../components/layout";
import ShowMeta from "../../components/seo/show";
import { getAllShows, getShowAndMoreShows } from "../../lib/api";
import { ShowInterface } from "../../types/shared";
import Loading from "../../views/loading";
import ShowBody from "../../views/radio/showBody";
import SinglePage from "../../views/singlePage";

interface Page extends JSX.Element {
  show: ShowInterface;
  preview: boolean;
}

export default function Show({ show, preview }: Page) {
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
    },
  };
}

export async function getStaticPaths() {
  const allShows = await getAllShows(false);

  return {
    paths: allShows?.map(({ slug }) => `/radio/${slug}`) ?? [],
    fallback: true,
  };
}
