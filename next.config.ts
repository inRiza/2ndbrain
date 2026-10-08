import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ponytail: cacheComponents breaks prerender with client auth gates
  cacheComponents: false,
  partialPrefetching: false,
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
