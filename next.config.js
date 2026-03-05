// @ts-check
const path = require("path");

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
  transpilePackages: ["@radix-ui", "@refuge-worldwide/calendar"],
  webpack: (config) => {
    // Alias the calendar package directly to its TypeScript source so Next.js
    // compiles it without needing a separate build/watch step in dev.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@refuge-worldwide/calendar$": path.resolve(
        __dirname,
        "packages/calendar/src/index.ts"
      ),
      "@refuge-worldwide/calendar/components": path.resolve(
        __dirname,
        "packages/calendar/src/components/index.ts"
      ),
      "@refuge-worldwide/calendar/api": path.resolve(
        __dirname,
        "packages/calendar/src/api/index.ts"
      ),
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/bookings",
        destination: "/studio-bookings",
        permanent: false,
      },
    ];
  },
};
