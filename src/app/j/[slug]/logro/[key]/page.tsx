import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AchievementBadge } from "@/components/ui/achievement-badge";
import {
  buildOgAchievementImageAlt,
  buildOgAchievementSharePayload,
} from "@/lib/og-achievement-share";
import { getAchievementDefinition } from "@/lib/player-achievements";
import { buildAchievementShareUrl } from "@/lib/share-ficha";
import {
  fetchPublicPlayerBySlug,
  getProtectedProfileTitle,
} from "@/lib/public-player";

interface PageProps {
  params: Promise<{ slug: string; key: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, key } = await params;
  const achievement = getAchievementDefinition(key);

  if (!achievement) {
    return { title: "Logro no disponible | MiFicha" };
  }

  const data = await fetchPublicPlayerBySlug(slug);
  if (!data) {
    return { title: "Logro no disponible | MiFicha" };
  }

  const payload = buildOgAchievementSharePayload(data, key);
  if (!payload) {
    return { title: "Logro no disponible | MiFicha" };
  }

  const title = getProtectedProfileTitle(
    data.player.first_name,
    data.player.last_name,
    data.player.birth_date,
  );
  const pageUrl = buildAchievementShareUrl(slug, key);
  const description = `${payload.achievementTitle} · ${payload.achievementDescription}`;
  const ogImageAlt = buildOgAchievementImageAlt(payload);

  return {
    title: `${payload.achievementTitle} · ${title} | MiFicha`,
    description,
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      title: `${payload.achievementTitle} · ${title}`,
      description,
      url: pageUrl,
      type: "website",
      siteName: "MiFicha",
      locale: "es_MX",
      images: [
        {
          url: `/j/${slug}/logro/${key}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${payload.achievementTitle} · ${title}`,
      description,
      images: [`/j/${slug}/logro/${key}/opengraph-image`],
    },
  };
}

export default async function AchievementSharePage({ params }: PageProps) {
  const { slug, key } = await params;
  const achievement = getAchievementDefinition(key);

  if (!achievement) {
    notFound();
  }

  const data = await fetchPublicPlayerBySlug(slug);
  if (!data) {
    notFound();
  }

  const title = getProtectedProfileTitle(
    data.player.first_name,
    data.player.last_name,
    data.player.birth_date,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          Insignia verificada
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {data.player.academies?.name ?? "Academia verificada"}
        </p>
      </div>

      <AchievementBadge
        achievementKey={achievement.key}
        title={achievement.title}
        description={achievement.description}
        rarity={achievement.rarity}
        emoji={achievement.emoji}
        highlight
      />

      <div className="flex flex-col gap-2">
        <Link
          href={`/j/${slug}`}
          className="mf-btn-accent-solid rounded-xl px-4 py-3 text-center text-sm font-semibold"
        >
          Ver ficha completa
        </Link>
        <p className="text-center text-xs text-slate-500">
          Comparte este link para que WhatsApp muestre la tarjeta del logro.
        </p>
      </div>
    </main>
  );
}
