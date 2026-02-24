// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["images.ctfassets.net"],
  },
  experimental: {
    scrollRestoration: true,
  },
  transpilePackages: ["@radix-ui"],
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/bookings',
        destination: '/studio-bookings',
        permanent: false,
      },
    ];
  },
};
