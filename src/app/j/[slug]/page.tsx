import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPlayerCard } from "@/components/public/public-player-card";
import { getPositionLabel } from "@/lib/dashboard-utils";
import {
  fetchPublicPlayerBySlug,
  getProtectedProfileTitle,
  getPublicProfileDescription,
} from "@/lib/public-player";
import { isMinor } from "@/lib/privacy";

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
  const protectMinor = isMinor(data.player.birth_date);

  return {
    title: `${title} | MiFicha`,
    description,
    robots: protectMinor
      ? { index: false, follow: false, nocache: true }
      : { index: false, follow: false },
    openGraph: protectMinor
      ? undefined
      : {
          title: `${title} | MiFicha`,
          description,
          type: "profile",
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
