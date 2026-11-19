import type { Metadata } from "next";
import { GphFunLanding } from "@/components/marketing/gph-fun-landing";
import {
  GPH_FUN,
  GPH_FUN_PATH,
  GPH_FUN_POSTER,
  gphFunPublicUrl,
} from "@/lib/gph-fun";

const title = `${GPH_FUN.title} · Querétaro`;
const description =
  "Nueva unidad GPH FUN: fiestas futboleras en Querétaro. Pregunta por las promociones de apertura con Mariana Castillo.";

export const metadata: Metadata = {
  title: `${title} | MiFicha`,
  description,
  openGraph: {
    title: `${title} | MiFicha`,
    description,
    url: gphFunPublicUrl(),
    type: "website",
    siteName: "MiFicha",
    locale: "es_MX",
    images: [
      {
        url: GPH_FUN_POSTER,
        width: 1080,
        height: 1350,
        alt: "Cartel GPH FUN fiestas futboleras Querétaro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | MiFicha`,
    description,
    images: [GPH_FUN_POSTER],
  },
  alternates: {
    canonical: GPH_FUN_PATH,
  },
};

export default function GphFunPage() {
  return <GphFunLanding />;
}
