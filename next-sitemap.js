// @ts-check

/**
 * @name isServerSidePath
 * @param {string} path
 */
function isServerSidePath(path) {
  if (path.includes("news/")) return true;
  if (path.includes("radio/")) return true;
  if (path.includes("artists/")) return true;

  return false;
}

/**
 * @type {import('next-sitemap').IConfig}
 */
module.exports = {
  siteUrl: "https://refugeworldwide.com",
  generateRobotsTxt: true,
  exclude: ["/server-sitemap.xml"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://refugeworldwide.com/server-sitemap.xml"],
  },
  transform: (config, path) => {
    if (isServerSidePath(path)) {
      return null;
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
