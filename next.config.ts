import type { NextConfig } from "next";

const PADEL_ORIGIN = "https://web-sand-five-32.vercel.app";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      // Compat: rutas viejas → /fut/*
      { source: "/dashboard", destination: "/fut/dashboard", permanent: false },
      { source: "/dashboard/:path*", destination: "/fut/dashboard/:path*", permanent: false },
      { source: "/login", destination: "/fut/login", permanent: false },
      { source: "/signup", destination: "/fut/signup", permanent: false },
      { source: "/explorar", destination: "/fut/explorar", permanent: false },
      { source: "/organizadores", destination: "/fut/organizadores", permanent: false },
      { source: "/padres", destination: "/fut/padres", permanent: false },
      { source: "/interno", destination: "/fut/interno", permanent: false },
      { source: "/interno/:path*", destination: "/fut/interno/:path*", permanent: false },
      { source: "/terminos", destination: "/fut/terminos", permanent: false },
      { source: "/aviso-privacidad", destination: "/fut/aviso-privacidad", permanent: false },
      { source: "/cookies", destination: "/fut/cookies", permanent: false },
      { source: "/j/:path*", destination: "/fut/j/:path*", permanent: false },
      { source: "/a/:path*", destination: "/fut/a/:path*", permanent: false },
      { source: "/api/:path*", destination: "/fut/api/:path*", permanent: false },
    ];
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
