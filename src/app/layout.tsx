import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppToaster } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MiFicha - Perfiles futbolísticos digitales",
  description:
    "Fichas técnicas verificadas para academias, padres y visorías, con protección de datos de menores.",
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
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
