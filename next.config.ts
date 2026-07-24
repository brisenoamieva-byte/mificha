import type { NextConfig } from "next";

const PADEL_ORIGIN = "https://web-sand-five-32.vercel.app";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    // Multi-zone: pádel vive en otro proyecto Vercel con basePath /padel
    return [
      {
        source: "/padel",
        destination: `${PADEL_ORIGIN}/padel`,
      },
      {
        source: "/padel/:path*",
        destination: `${PADEL_ORIGIN}/padel/:path*`,
      },
    ];
  },
};

export default nextConfig;
