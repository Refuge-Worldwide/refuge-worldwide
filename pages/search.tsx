import dayjs from "dayjs";
import fuzzysort from "fuzzysort";
import { InferGetStaticPropsType } from "next";
import { ChangeEvent, useMemo, useState } from "react";
import { ArticlePreviewForSearch } from "../components/articlePreview";
import ArtistPreview from "../components/artistPreview";
import Layout from "../components/layout";
import Pill from "../components/pill";
import PageMeta from "../components/seo/page";
import { ShowPreviewWithoutPlayer } from "../components/showPreview";
import { getSearchData } from "../lib/api";
import {
  ArticleInterface,
  ArtistInterface,
  ShowInterface,
} from "../types/shared";

interface SearchShowInterface extends ShowInterface {
  type: "SHOW";
}

interface SearchArtistInterface extends ArtistInterface {
  type: "ARTIST";
  title: string;
}

interface SearchArticleInterface extends ArticleInterface {
  type: "ARTICLE";
}

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      data: (await getSearchData()) as Array<
        SearchShowInterface | SearchArtistInterface | SearchArticleInterface
      >,
    },
  };
}

export default function SearchPage({
  preview,
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [search, searchSet] = useState("");
  const searchOnChange = (event: ChangeEvent<HTMLInputElement>) =>
    searchSet(event.target.value?.toLowerCase());

  const result = fuzzysort.go(search ? search.trim() : undefined, data, {
    key: "title",
    allowTypo: true,
    threshold: -999,
    limit: 20,
  });

  const showResults = useMemo(() => {
    if (search) {
      return result
        .filter((el) => el.obj.type === "SHOW")
        .map((el) => el.obj)
        .sort((a: SearchShowInterface, b: SearchShowInterface) =>
          dayjs(a.date).isAfter(b.date) ? -1 : 1
        );
    }

    return data.filter((el) => el.type === "SHOW").slice(0, 5);
  }, [result, search, data]);

  const articleResults = useMemo(() => {
    if (search) {
      return result
        .filter((el) => el.obj.type === "ARTICLE")
        .map((el) => el.obj)
        .sort((a: SearchArticleInterface, b: SearchArticleInterface) =>
          dayjs(a.date).isAfter(b.date) ? -1 : 1
        );
    }

    return data.filter((el) => el.type === "ARTICLE").slice(0, 5);
  }, [result, search, data]);

  const artistResults = useMemo(() => {
    if (search) {
      return result
        .filter((el) => el.obj.type === "ARTIST")
        .map((el) => el.obj);
    }

    return data.filter((el) => el.type === "ARTIST").slice(0, 5);
  }, [result, search, data]);

  const hasNoResults =
    showResults.length === 0 &&
    artistResults.length === 0 &&
    articleResults.length === 0;

  return (
    <Layout preview={preview}>
      <PageMeta title="Search | Refuge Worldwide" path="search/" />

      <section className="bg-black">
        <div className="container-md p-4 sm:p-8">
          <div className="pb-3 sm:pb-6">
            <input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              autoFocus
              className="pill-input-invert"
              id="search"
              name="search"
              onChange={searchOnChange}
              placeholder="New Search"
              type="search"
              value={search}
            />
          </div>
        </div>
      </section>

      {hasNoResults && (
        <section>
          <div className="container-md p-4 sm:p-8">
            <div className="pt-10">
              <p>
                No results for{" "}
                <span className="font-medium">{`"${search}"`}</span>
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="divide-y-2">
        {showResults.length > 0 && (
          <section>
            <div className="p-4 sm:p-8">
              <Pill>
                <h2>Shows</h2>
              </Pill>

              <div className="h-5" />

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 sm:gap-8">
                {showResults?.map((show: SearchShowInterface) => (
                  <li key={show.slug}>
                    <ShowPreviewWithoutPlayer {...show} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {articleResults.length > 0 && (
          <section>
            <div className="p-4 sm:p-8">
              <Pill>
                <h2>News</h2>
              </Pill>

              <div className="h-5" />

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 sm:gap-8">
                {articleResults?.map((article: SearchArticleInterface) => (
                  <li key={article.slug}>
                    <ArticlePreviewForSearch {...article} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {artistResults.length > 0 && (
          <section>
            <div className="p-4 sm:p-8">
              <Pill>
                <h2>Artists</h2>
              </Pill>

              <div className="h-5" />

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-6 sm:gap-8">
                {artistResults?.map((artist: SearchArtistInterface) => {
                  const _artist = {
                    ...artist,
                    name: artist.title,
                  };

                  return (
                    <li key={artist.slug}>
                      <ArtistPreview {..._artist} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}
      </div>

      <div className="h-10" />
    </Layout>
  );
}
