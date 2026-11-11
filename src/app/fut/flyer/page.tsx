import type { Metadata } from "next";
import Link from "next/link";

const FLYER_SRC = "/marketing/mificha-flyer-whatsapp-diagnostico.jpg";
const DEST = "/fut";

export const metadata: Metadata = {
  title: "MiFicha · Flyer",
  description:
    "Plataforma de futbol para familias: ficha del jugador, visorías y diagnostico GPH.",
  openGraph: {
    title: "MiFicha · Ficha de futbol",
    description:
      "Diagnostico GPH + 12 meses. Ficha del jugador. Entra a www.mificha.mx",
    images: [
      {
        url: FLYER_SRC,
        width: 1080,
        height: 1440,
        alt: "MiFicha flyer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MiFicha · Ficha de futbol",
    description: "Diagnostico GPH + 12 meses. Entra a www.mificha.mx",
    images: [FLYER_SRC],
  },
};

export default function FlyerPage() {
  return (
    <main className="min-h-dvh bg-[#08182f]">
      <Link
        href={DEST}
        className="mx-auto flex min-h-dvh max-w-[480px] items-center justify-center p-0"
        aria-label="Abrir MiFicha"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FLYER_SRC}
          alt="MiFicha · diagnostico GPH y ficha de futbol. Toca para entrar."
          className="h-auto w-full max-w-[480px] object-contain"
        />
      </Link>
    </main>
  );
}
