import { useCallback, useState } from "react";
import { InferGetStaticPropsType } from "next";
import { getSubmissionPage } from "../lib/contentful/pages/submission";
import ShowSubmissionForm from "../components/showSubmissionForm";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import SinglePage from "../views/singlePage";
import Head from "next/head";
import { getAllGenres } from "../lib/contentful/pages/radio";
import { getAllArtists } from "../lib/contentful/pages/submission";

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
            <ShowSubmissionForm
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
