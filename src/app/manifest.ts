import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MiFicha",
    short_name: "MiFicha",
    description:
      "Espacio para tutores: ficha del jugador, oportunidades, visorías y GPH.",
    start_url: "/fut/tutor",
    display: "standalone",
    background_color: "#F4F7FB",
    theme_color: "#1B4F8C",
    lang: "es-MX",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
