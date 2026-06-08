import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPlayerCard } from "@/components/public/public-player-card";
import { getPositionLabel } from "@/lib/dashboard-utils";
import {
  buildOgPlayerImageAlt,
  buildOgPlayerSharePayload,
} from "@/lib/og-player-share";
import {
  fetchPublicPlayerBySlug,
  getProtectedProfileTitle,
  getPublicProfileDescription,
} from "@/lib/public-player";
import { buildPublicPlayerUrl } from "@/lib/player-utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchPublicPlayerBySlug(slug);

  if (!data) {
    return {
      title: "Ficha no disponible | MiFicha",
      robots: { index: false, follow: false },
    };
  }

  const positionLabel = getPositionLabel(data.player.position);
  const title = getProtectedProfileTitle(
    data.player.first_name,
    data.player.last_name,
    data.player.birth_date,
  );
  const description = getPublicProfileDescription(data, 0, positionLabel);
  const sharePayload = buildOgPlayerSharePayload(data);
  const pageUrl = buildPublicPlayerUrl(slug);
  const ogImageAlt = buildOgPlayerImageAlt(sharePayload);

  return {
    title: `${title} | MiFicha`,
    description,
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      title: `${title} | MiFicha`,
      description,
      url: pageUrl,
      type: "website",
      siteName: "MiFicha",
      locale: "es_MX",
      images: [
        {
          url: `/j/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MiFicha`,
      description,
      images: [`/j/${slug}/opengraph-image`],
    },
  };
}

export default async function PlayerPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchPublicPlayerBySlug(slug);

  if (!data) {
    notFound();
  }

  return <PublicPlayerCard data={data} />;
}
