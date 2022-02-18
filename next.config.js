// @ts-check

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withBundleAnalyzer({
  images: {
    domains: ["images.ctfassets.net"],
  },
  reactStrictMode: true,
  swcMinify: true,
});
