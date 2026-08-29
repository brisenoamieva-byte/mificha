import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      { source: "/", destination: "/fut", permanent: false },
      { source: "/padel", destination: "/fut", permanent: false },
      { source: "/padel/:path*", destination: "/fut", permanent: false },
      // Compat: rutas viejas → /fut/*
      { source: "/dashboard", destination: "/fut/dashboard", permanent: false },
      { source: "/dashboard/:path*", destination: "/fut/dashboard/:path*", permanent: false },
      { source: "/login", destination: "/fut/login", permanent: false },
      { source: "/signup", destination: "/fut/signup", permanent: false },
      { source: "/recuperar", destination: "/fut/recuperar", permanent: false },
      { source: "/recuperar/:path*", destination: "/fut/recuperar/:path*", permanent: false },
      { source: "/explorar", destination: "/fut/explorar", permanent: false },
      { source: "/organizadores", destination: "/fut/organizadores", permanent: false },
      { source: "/padres", destination: "/fut/padres", permanent: false },
      { source: "/evaluaciones", destination: "/fut/evaluaciones", permanent: false },
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
};

export default nextConfig;
