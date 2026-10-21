import type { NextConfig } from "next";

const strapiUrl = new URL(process.env.STRAPI_URL || "http://localhost:1340");
const strapiIsLocal = ["localhost", "127.0.0.1", "::1"].includes(strapiUrl.hostname);

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    // Content images come from the Strapi Media Library.
    remotePatterns: [
      {
        protocol: strapiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: strapiUrl.hostname,
        port: strapiUrl.port,
        pathname: "/uploads/**",
      },
    ],
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
    // Only needed when Strapi runs on this machine during development.
    dangerouslyAllowLocalIP: strapiIsLocal,
  },
  async rewrites() {
    // Same-origin access to uploaded icons, so CSS masks can recolor CMS SVGs.
    return [{ source: "/uploads/:path*", destination: `${strapiUrl.origin}/uploads/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
