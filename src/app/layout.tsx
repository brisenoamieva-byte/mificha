import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { DevServiceWorkerCleanup } from "@/components/dev-service-worker-cleanup";
import { AuthRecoveryRedirect } from "@/components/auth/auth-recovery-redirect";
import { CookieNotice } from "@/components/marketing/cookie-notice";
import { AppToaster } from "@/components/ui/toast";
import { BRAND_OG_IMAGE } from "@/lib/brand";
import "./globals.css";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://mificha.mx";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Avoid build-time Supabase fetches when DNS/env is unavailable on the builder.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MiFicha · Tu ficha deportiva",
  description:
    "Ficha deportiva de fútbol: planteles, torneos escolares y evaluación GPH.",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "MiFicha · Tu ficha deportiva",
    description:
      "Ficha deportiva de fútbol: planteles, torneos escolares y evaluación GPH.",
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
    title: "MiFicha · Tu ficha deportiva",
    description:
      "Ficha deportiva de fútbol: planteles, torneos escolares y evaluación GPH.",
    images: [BRAND_OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: "#1B4F8C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-mf-canvas font-sans text-mf-text antialiased">
        <DevServiceWorkerCleanup />
        <AuthRecoveryRedirect />
        {children}
        <CookieNotice />
        <AppToaster />
      </body>
    </html>
  );
}
