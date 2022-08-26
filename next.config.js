// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["images.ctfassets.net"],
  },
  experimental: {
    images: {
      allowFutureImage: true,
    },
  },
};
