import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cursor/identity.ts uses ESM .js import paths that resolve to .ts siblings
  turbopack: {
    resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"],
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
};

export default nextConfig;
