import { useDebouncedCallback } from "use-debounce";
import { InferGetStaticPropsType } from "next";
import { isEmpty } from "ts-extras";
import { ArticlePreviewForSearch } from "../components/articlePreview";
import ArtistPreview from "../components/artistPreview";
import Layout from "../components/layout";
import Pill from "../components/pill";
import PageMeta from "../components/seo/page";
import { ShowPreviewWithoutPlayer } from "../components/showPreview";
import useSearchData from "../hooks/useSearch";
import { getSearchData } from "../lib/contentful/search";
import { useRouter } from "next/router";
import Loading from "../components/loading";

export async function getStaticProps() {
  const { data } = await getSearchData("");

  return {
    props: {
      fallbackData: data,
    },
  };
}

export default function SearchPage({
  fallbackData,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();

  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`);

    router.replace({
      query: { ...router.query, query: term },
    });
  }, 500);

  const { data, isValidating } = useSearchData(
    router.query.query ? router.query.query.toString() : "",
    {
      fallbackData,
    }
  );

  const isDataEmpty = isEmpty([
    ...data.shows,
    ...data.articles,
    ...data.artists,
  ]);

  return (
    <Layout>
      <PageMeta title="Search | Refuge Worldwide" path="search/" />

      <section className="bg-black">
        <div className="container-md p-4 sm:p-8">
          <div className="pb-3 sm:pb-6">
            <input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              autoFocus
              className="pill-input-invert placeholder-white/80"
              id="search"
              name="search"
              onChange={(e) => {
                handleSearch(e.target.value);
              }}
              placeholder="Search shows, news and artists..."
              defaultValue={router.query.query?.toString()}
            />
          </div>
        </div>
      </section>

      {isValidating && (
        <section className="border-b-2 min-h-screen">
          <div className="container-md p-4 pb-[calc(1rem-2px)] sm:p-8 sm:pb-[calc(2rem-2px)]">
            <div className="pt-10 pb-10">
              <p>
                <Loading />
              </p>
            </div>
          </div>
        </section>
      )}

      {!isValidating && (
        <div className="divide-y-2">
          {router.query.query && (
            <div className={`${isDataEmpty && "container-md"} p-4 sm:p-8`}>
              <p>
                {isDataEmpty ? "No results" : "Results"} for{" "}
                <span className="font-medium">{`${router.query.query?.toString()}`}</span>
              </p>
            </div>
          )}
          {!isEmpty(data.shows) && (
            <section>
              <div className="p-4 sm:p-8">
                <Pill>
                  <h2>Shows</h2>
                </Pill>

                <div className="h-5" />

                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 sm:gap-8">
                  {data.shows.map((show) => (
                    <li key={show.fields.slug}>
                      <ShowPreviewWithoutPlayer {...show} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {!isEmpty(data.articles) && (
            <section>
              <div className="p-4 sm:p-8">
                <Pill>
                  <h2>News</h2>
                </Pill>

                <div className="h-5" />

                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 sm:gap-8">
                  {data.articles.map((article) => (
                    <li key={article.fields.slug}>
                      <ArticlePreviewForSearch {...article} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {!isEmpty(data.artists) && (
            <section>
              <div className="p-4 sm:p-8">
                <Pill>
                  <h2>Artists</h2>
                </Pill>

                <div className="h-5" />

                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-6 sm:gap-8">
                  {data.artists.map((artist) => {
                    return (
                      <li key={artist.fields.slug}>
                        <ArtistPreview
                          name={artist.fields.name}
                          slug={artist.fields.slug}
                          src={artist.fields.photo.fields.file.url}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          )}
        </div>
      )}

      <div className="h-10" />
    </Layout>
  );
}
