import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FichaLockedTeaser } from "@/components/marketing/explore-paywall";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { PublicPlayerCard } from "@/components/public/public-player-card";
import { getPositionLabel } from "@/lib/dashboard-utils";
import { isDemoPlayerSlug } from "@/lib/demo-ficha-preview";
import {
  buildOgPlayerImageAlt,
  buildOgPlayerSharePayload,
} from "@/lib/og-player-share";
import { formatPlayerCategory } from "@/lib/player-category";
import {
  fetchPublicPlayerBySlug,
  getProtectedProfileTitle,
  getPublicProfileDescription,
} from "@/lib/public-player";
import { buildPublicPlayerUrl } from "@/lib/player-utils";
import { resolveExploreAccess } from "@/lib/scout-access";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (isDemoPlayerSlug(slug)) {
    return {
      title: "Ficha no disponible | MiFicha",
      robots: { index: false, follow: false },
    };
  }

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
          url: `/fut/j/${slug}/opengraph-image`,
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
      images: [`/fut/j/${slug}/opengraph-image`],
    },
  };
}

export default async function PlayerPublicPage({ params }: PageProps) {
  const { slug } = await params;

  if (isDemoPlayerSlug(slug)) {
    notFound();
  }

  const data = await fetchPublicPlayerBySlug(slug);

  if (!data) {
    notFound();
  }

  const access = await resolveExploreAccess();
  if (!access.unlocked) {
    const fullName = `${data.player.first_name} ${data.player.last_name}`.trim();
    const place = [data.player.academies?.city, data.player.academies?.name]
      .filter(Boolean)
      .join(" · ");
    const fichaPath = `/fut/j/${encodeURIComponent(slug)}`;
    const loginHref = `/fut/login?next=${encodeURIComponent(fichaPath)}`;
    return (
      <div className="flex min-h-dvh flex-col bg-mf-canvas">
        <SiteHeader actionHref="/fut/tutor" actionLabel="Mis fichas" />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
          <FichaLockedTeaser
            name={fullName}
            position={getPositionLabel(data.player.position)}
            category={formatPlayerCategory(data.player.birth_date)}
            place={place || null}
            loginHref={loginHref}
            returnPath={fichaPath}
          />
          <p className="mt-6 text-center text-xs leading-6 text-mf-text-muted">
            Busca más jugadores en{" "}
            <Link href="/fut/explorar" className="font-semibold text-mf-gph hover:underline">
              Explorar
            </Link>
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return <PublicPlayerCard data={data} />;
}
