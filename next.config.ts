import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  // CSP estricto se deja para una pasada con nonce (Stripe/Leaflet/Supabase).
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
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
      { source: "/visorias", destination: "/fut/visorias", permanent: false },
      { source: "/membresia", destination: "/fut/membresia", permanent: false },
      { source: "/pagar", destination: "/fut/pagar", permanent: false },
      { source: "/tutor", destination: "/fut/tutor", permanent: false },
      { source: "/f/:path*", destination: "/fut/f/:path*", permanent: false },
      { source: "/interno", destination: "/fut/interno", permanent: false },
      { source: "/interno/:path*", destination: "/fut/interno/:path*", permanent: false },
      { source: "/terminos", destination: "/fut/terminos", permanent: false },
      { source: "/terminos-y-condiciones", destination: "/fut/terminos", permanent: true },
      { source: "/aviso-privacidad", destination: "/fut/aviso-privacidad", permanent: false },
      { source: "/aviso-de-privacidad", destination: "/fut/aviso-privacidad", permanent: true },
      { source: "/privacidad", destination: "/fut/aviso-privacidad", permanent: true },
      { source: "/politica-de-privacidad", destination: "/fut/aviso-privacidad", permanent: true },
      { source: "/cookies", destination: "/fut/cookies", permanent: false },
      { source: "/politica-de-cookies", destination: "/fut/cookies", permanent: true },
      { source: "/j/:path*", destination: "/fut/j/:path*", permanent: false },
      { source: "/a/:path*", destination: "/fut/a/:path*", permanent: false },
      { source: "/api/:path*", destination: "/fut/api/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
