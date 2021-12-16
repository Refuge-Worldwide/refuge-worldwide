const { withPlaiceholder } = require("@plaiceholder/next");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withPlaiceholder(
  withBundleAnalyzer({
    images: {
      domains: ["images.ctfassets.net"],
    },
    reactStrictMode: true,
    swcMinify: true,
  })
);
