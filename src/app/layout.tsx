import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppToaster } from "@/components/ui/toast";
import { DevServiceWorkerCleanup } from "@/components/dev-service-worker-cleanup";
import { BRAND_ICON, BRAND_OG_IMAGE } from "@/lib/brand";
import "./globals.css";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://mificha.mx";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MiFicha - Perfiles futbolísticos digitales",
  description:
    "Fichas técnicas verificadas para academias, padres y visorías, con protección de datos de menores.",
  metadataBase: new URL(appUrl),
  icons: {
    icon: BRAND_ICON,
    apple: BRAND_ICON,
  },
  openGraph: {
    title: "MiFicha — La ficha técnica digital",
    description:
      "Fichas técnicas verificadas para academias, padres y visorías.",
    url: appUrl,
    siteName: "MiFicha",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: BRAND_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "MiFicha",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MiFicha — La ficha técnica digital",
    description:
      "Fichas técnicas verificadas para academias, padres y visorías.",
    images: [BRAND_OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: "#1B4F8C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-mf-canvas font-sans text-mf-text antialiased">
        <DevServiceWorkerCleanup />
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
