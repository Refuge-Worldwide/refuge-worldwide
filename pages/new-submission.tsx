import { useCallback, useState, useEffect } from "react";
import { InferGetStaticPropsType } from "next";
import { getSubmissionPage } from "../lib/contentful/pages/submission";
import ShowSubmissionForm from "../components/showSubmissionForm";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import SinglePage from "../views/singlePage";
import Head from "next/head";
import { getAllGenres } from "../lib/contentful/pages/radio";
import { getAllArtists } from "../lib/contentful/pages/submission";
import { useSearchParams } from "next/navigation";
import Loading from "../components/loading";
import {
  Dropdown,
  ShowInterface,
  SubmissionImportantInfo,
} from "../types/shared";

export async function getStaticProps({ preview = false }) {
  const genres = await getAllGenres();
  const AllArtists = await getAllArtists();
  return {
    props: {
      genres: genres.map((genre) => ({
        value: genre.sys.id,
        label: genre.name,
      })),
      artists: AllArtists,
      preview,
      ...(await getSubmissionPage(preview)),
    },
  };
}

export default function NewSubmissionPage({
  genres,
  artists,
  coverImage,
  liveShows,
  liveShows2,
  preRecords,
  uploadLink,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      fetch(`/api/show-submission?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        });
    }
  }, [id]);

  const importantInfo = {
    liveShows: liveShows,
    liveShows2: liveShows2,
    preRecords: preRecords,
  };

  return (
    <Layout>
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <PageMeta title="Show Submission | Refuge Worldwide" path="submission/" />
      <SinglePage coverImage={coverImage}>
        <section className="container-md p-4 sm:p-8 bg-white">
          <div id="submission-form" className="prose max-w-none sm:prose-lg">
            <h1>Show Submission Form</h1>
            <SubmissionForm
              isLoading={isLoading}
              data={data}
              genres={genres}
              artists={artists}
              uploadLink={uploadLink}
              importantInfo={importantInfo}
            />
          </div>
        </section>
      </SinglePage>
    </Layout>
  );
}

function SubmissionForm({
  isLoading,
  data,
  genres,
  artists,
  uploadLink,
  importantInfo,
}: {
  isLoading: boolean;
  data: ShowInterface;
  genres: Dropdown;
  artists: Dropdown;
  uploadLink: string;
  importantInfo: SubmissionImportantInfo;
}) {
  if (isLoading) return <Loading />;

  if (!data.title || data.status == "TBC")
    return (
      <div className="my-32">
        <p>
          Error loading submission form. If this error pursists please contact
          [email]
        </p>
      </div>
    );

  if (data.status == "Submitted")
    return (
      <div className="my-32">
        <p>
          Show submission already completed. Please contact
          hello@refugeworldwide.com if this information is incorrect
        </p>
      </div>
    );

  return (
    <ShowSubmissionForm
      initial={data}
      genres={genres}
      artists={artists}
      uploadLink={uploadLink}
      importantInfo={importantInfo}
    />
  );
}
