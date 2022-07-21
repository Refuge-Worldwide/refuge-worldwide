import { GetServerSideProps } from "next";
import { getServerSideSitemap } from "next-sitemap";
import { ISitemapField } from "next-sitemap/dist/@types/interface";
import { getSitemapSlugs } from "../../lib/contentful/paths";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { artists, articles, shows } = await getSitemapSlugs();

  const slugs = [...articles, ...artists, ...shows];

  const fields: ISitemapField[] = slugs.map((slug) => ({
    loc: slug,
    lastmod: new Date().toISOString(),
    changefreq: "daily",
    priority: 0.7,
  }));

  return getServerSideSitemap(ctx, fields);
};

export default function ServerSitemap() {}
