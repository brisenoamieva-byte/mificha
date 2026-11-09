import type { Metadata } from "next";
import { CracksTryoutsLanding } from "@/components/marketing/cracks-tryouts-landing";
import {
  CRACKS_TRYOUTS,
  CRACKS_TRYOUTS_PATH,
  CRACKS_TRYOUTS_POSTER,
  cracksTryoutsPublicUrl,
} from "@/lib/cracks-tryouts";

const title = `${CRACKS_TRYOUTS.title} · Try outs noviembre`;
const description =
  "CRACKS llega a Querétaro con try outs durante todo noviembre en Colegio San Javier. Solicita tu liga de registro por WhatsApp.";

export const metadata: Metadata = {
  title: `${title} | MiFicha`,
  description,
  openGraph: {
    title: `${title} | MiFicha`,
    description,
    url: cracksTryoutsPublicUrl(),
    type: "website",
    siteName: "MiFicha",
    locale: "es_MX",
    images: [
      {
        url: CRACKS_TRYOUTS_POSTER,
        width: 1080,
        height: 1350,
        alt: "Cartel CRACKS try outs Querétaro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | MiFicha`,
    description,
    images: [CRACKS_TRYOUTS_POSTER],
  },
  alternates: {
    canonical: CRACKS_TRYOUTS_PATH,
  },
};

export default function CracksTryoutsPage() {
  return <CracksTryoutsLanding />;
}
