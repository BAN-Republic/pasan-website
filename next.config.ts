import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },
  partialPrefetching: true,
  experimental: {
    // Turbopack's on-disk cache kept serving an old app/globals.css (through the
    // @tailwindcss/turbopack loader below) after the file changed, in both `next dev` and
    // `next build`. Vercel restores .next/cache between deploys, so CSS fixes could silently
    // not ship. Off = every build compiles the current CSS (≈20 s more per build).
    turbopackFileSystemCacheForBuild: false,
    turbopackFileSystemCacheForDev: false,
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
