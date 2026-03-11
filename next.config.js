// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  reactStrictMode: true,
  webpack(config) {
    // Swap full hls.js for the light build (~30% smaller, no EME/DRM/CMAF)
    config.resolve.alias["hls.js"] = "hls.js/dist/hls.light.js";
    return config;
  },
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
        source: "/bookings",
        destination: "/studio-bookings",
        permanent: false,
      },
    ];
  },
};
