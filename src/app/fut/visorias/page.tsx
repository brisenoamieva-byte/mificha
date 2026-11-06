import type { Metadata } from "next";
import { VisoriaLanding } from "@/components/visoria/visoria-landing";

export const metadata: Metadata = {
  title: "Visorías GPH / CRACKS · Querétaro | MiFicha",
  description:
    "Registro a visorías gratuitas el 26 y 27 de noviembre en Querétaro, con visores de Chivas y Santos Laguna. Lo llena el tutor; confirmamos por WhatsApp.",
  openGraph: {
    title: "Visorías gratuitas GPH / CRACKS en Querétaro",
    description:
      "26 y 27 de noviembre. Registro en un link, sin Google Forms. Femenil 2008–2012, varonil 2010–2017.",
    images: ["/partners/visorias-queretaro-nov-2026.jpg"],
  },
};

export default function VisoriasPage() {
  return <VisoriaLanding />;
}
