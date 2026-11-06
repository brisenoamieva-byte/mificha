import type { Metadata } from "next";
import { VisoriaLanding } from "@/components/visoria/visoria-landing";
import { VISORIA_OG_IMAGE } from "@/lib/visoria-event";

const ogTitle = "Visorías gratuitas GPH / CRACKS en Querétaro";
const ogDescription =
  "26 y 27 de noviembre. Registro en un link, sin Google Forms. Femenil 2008–2012, varonil 2010–2017.";

export const metadata: Metadata = {
  title: "Visorías GPH / CRACKS · Querétaro | MiFicha",
  description:
    "Registro a visorías gratuitas el 26 y 27 de noviembre en Querétaro, con visores de Chivas y Santos Laguna. Lo llena el tutor; confirmamos por WhatsApp.",
  openGraph: {
    title: ogTitle,
    description: ogDescription,
    url: "/fut/visorias",
    type: "website",
    images: [
      {
        url: VISORIA_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Visorías gratuitas GPH / CRACKS · visores de Chivas y Santos Laguna en Querétaro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
    images: [VISORIA_OG_IMAGE],
  },
};

export default function VisoriasPage() {
  return <VisoriaLanding />;
}
