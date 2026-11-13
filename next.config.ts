import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow computer-use / phone-tunnel testing via 127.0.0.1 (not only localhost)
  allowedDevOrigins: ["127.0.0.1"],
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
