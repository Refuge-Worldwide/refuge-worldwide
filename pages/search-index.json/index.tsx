import dayjs from "dayjs";
import { GetServerSideProps } from "next";
import { getAllEntries } from "../../lib/contentful/client";
import {
  TypeArticleFields,
  TypeArtistFields,
  TypeShowFields,
} from "../../types/contentful";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const start = Date.now();

  const [allShows, allArticles, allArtists] = await Promise.all([
    getAllEntries<TypeShowFields>("show", 500, {
      "fields.mixcloudLink[exists]": true,
      "fields.date[lte]": dayjs().format("YYYY-MM-DD"),
    }),
    getAllEntries<TypeArticleFields>("article", 100),
    getAllEntries<TypeArtistFields>("artist", 100),
  ]);

  const shows = allShows.map((show) => ({
    title: show.fields.title,
    slug: show.fields.slug,
    date: show.fields.date,
    artists: show.fields.artists.map((artist) => artist.fields.name),
    genres: show.fields.genres.map((genre) => genre.fields.name),
    coverImage: show.fields.coverImage.fields.file.url,
  }));

  const articles = allArticles.map((article) => ({
    title: article.fields.title,
    slug: article.fields.slug,
    date: article.fields.date,
    coverImage: article.fields.coverImage.fields.file.url,
    articleType: article.fields.articleType,
  }));

  const artists = allArtists.map((artist) => ({
    name: artist.fields.name,
    slug: artist.fields.slug,
    photo: artist.fields.photo.fields.file.url,
  }));

  const content = {
    shows,
    articles,
    artists,
  };

  const end = Date.now();

  const { res } = ctx;

  res.setHeader("Content-Type", "application/json");

  res.setHeader("Server-Timing", `search-index;dur=${end - start}`);

  res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59");

  res.write(JSON.stringify(content));

  res.end();

  return {
    props: {},
  };
};

export default function SearchIndex() {}
