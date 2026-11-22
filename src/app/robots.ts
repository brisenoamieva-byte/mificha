import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/app-url";

/**
 * Guías para crawlers. Las fichas de menores (/fut/j/*) van con noindex
 * en metadata y aquí se refuerza el disallow.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getAppBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/fut/api/",
          "/fut/dashboard/",
          "/fut/interno/",
          "/fut/tutor/",
          "/fut/j/",
          "/fut/f/",
          "/fut/d/",
          "/fut/firmar/",
          "/fut/arbitro/",
          "/fut/unirse/",
          "/fut/agente/m/",
          "/fut/pagar/",
          "/fut/confirmar/",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
