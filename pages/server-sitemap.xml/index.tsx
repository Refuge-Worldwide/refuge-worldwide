import { GetServerSideProps } from "next";
import { getServerSideSitemap } from "next-sitemap";
import { ISitemapField } from "next-sitemap/dist/@types/interface";
import { getSitemapPaths } from "../../lib/api/paths";

const createSlug = (slug: string, base: "artists" | "radio" | "news") =>
  `https://refugeworldwide.com/${base}/${slug}`;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { artists, articles, shows } = await getSitemapPaths();

  const slugs = [
    ...articles.map(({ slug }) => createSlug(slug, "news")),
    ...artists.map(({ slug }) => createSlug(slug, "artists")),
    ...shows.map(({ slug }) => createSlug(slug, "radio")),
  ];

  const fields: ISitemapField[] = slugs.map((slug) => ({
    loc: slug,
    lastmod: new Date().toISOString(),
    changefreq: "daily",
    priority: 0.7,
  }));

  return getServerSideSitemap(ctx, fields);
};

export default function ServerSitemap() {}
