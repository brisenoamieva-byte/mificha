import type { Metadata } from "next";
import { GphPachucaLanding } from "@/components/marketing/gph-pachuca-landing";
import {
  GPH_PACHUCA_PATH,
  GPH_PACHUCA_POSTER,
  GPH_PACHUCA_SEGUNDA_FASE,
  gphPachucaPublicUrl,
} from "@/lib/gph-pachuca-segunda-fase";

const title = `${GPH_PACHUCA_SEGUNDA_FASE.eyebrow} · Club Pachuca`;
const description = GPH_PACHUCA_SEGUNDA_FASE.headline;

export const metadata: Metadata = {
  title: `${title} | MiFicha`,
  description,
  openGraph: {
    title: `${title} | MiFicha`,
    description,
    url: gphPachucaPublicUrl(),
    type: "article",
    siteName: "MiFicha",
    locale: "es_MX",
    images: [
      {
        url: GPH_PACHUCA_POSTER,
        width: 1080,
        height: 1350,
        alt: "Orgullo GPH · segunda fase Club Pachuca",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | MiFicha`,
    description,
    images: [GPH_PACHUCA_POSTER],
  },
  alternates: {
    canonical: GPH_PACHUCA_PATH,
  },
};

export default function GphPachucaPage() {
  return <GphPachucaLanding />;
}
