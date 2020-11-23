import { useRouter } from "next/dist/client/router";
import ErrorPage from "next/error";
import Head from "next/head";
import Layout from "../../components/layout";
import ShowBody from "../../components/showBody";
import SinglePage from "../../components/singlePage";
import { getAllShows, getShowAndMoreShows } from "../../lib/api";
import { ShowInterface } from "../../types/shared";

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
        <h1>Loading…</h1>
      ) : (
        <>
          <Head>
            <title>{show.title} | Refuge Worldwide</title>
            <meta property="og:image" content={show.coverImage.url} />
          </Head>

          <SinglePage coverImage={show.coverImage} withBackButton>
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
