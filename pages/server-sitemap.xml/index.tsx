import { GetServerSideProps } from "next";
import { getServerSideSitemap } from "next-sitemap";
import { ISitemapField } from "next-sitemap/dist/@types/interface";
import { getSitemapSlugs } from "../../lib/contentful/paths";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Crawlers hit this often and it pages through all of Contentful.
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );

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
