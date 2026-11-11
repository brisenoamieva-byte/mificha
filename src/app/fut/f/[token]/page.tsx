import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { DiagnosisHireCard } from "@/components/public/diagnosis-hire-card";
import { PlayerCodeConnections } from "@/components/tutor/player-code-connections";
import { PublicCodeStub } from "@/components/tutor/public-code-stub";
import { TutorFichaViewTracker } from "@/components/tutor/tutor-ficha-view-tracker";
import { TutorPublicFicha } from "@/components/tutor/tutor-public-ficha";
import { TutorShareActions } from "@/components/tutor/tutor-share-actions";
import {
  buildOgTutorImageAlt,
  buildOgTutorSharePayload,
  buildTutorShareAbsoluteUrl,
} from "@/lib/og-tutor-share";
import { resolvePublicCode } from "@/lib/public-code-resolve";
import { fetchTutorLinkedPerformance } from "@/lib/tutor-linked-performance";
import {
  getTutorChildByShareToken,
  listTutorMaterials,
  listTutorSeasons,
  peekTutorChildByShareToken,
  tutorSharePath,
} from "@/lib/tutor-family";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  try {
    const admin = createSupabaseAdminClient();
    const child = await peekTutorChildByShareToken(admin, token);
    if (child) {
      const bits = [
        child.profile.position,
        child.profile.club,
        child.profile.city,
      ].filter(Boolean);
      const title = `${child.player_name} · Ficha | MiFicha`;
      const description =
        bits.length > 0
          ? `Ficha de ${child.player_name}: ${bits.join(" · ")}. Material del tutor, rendimiento y seguimiento en MiFicha.`
          : `Ficha de presentación de ${child.player_name}. Material del tutor en MiFicha.`;
      const access = child.public_code || child.share_token;
      const pageUrl = buildTutorShareAbsoluteUrl(access);
      const ogPayload = buildOgTutorSharePayload(child);
      const ogImage = `/fut/f/${encodeURIComponent(token)}/opengraph-image`;
      return {
        title,
        description,
        robots: { index: false, follow: false },
        openGraph: {
          title,
          description,
          url: pageUrl,
          type: "website",
          siteName: "MiFicha",
          locale: "es_MX",
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: buildOgTutorImageAlt(ogPayload),
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [ogImage],
        },
      };
    }

    const resolved = await resolvePublicCode(admin, token);
    if (!resolved) return { title: "Ficha | MiFicha", robots: { index: false } };
    const name =
      resolved.player?.displayName ||
      resolved.visoria?.playerName ||
      "Jugador";
    return {
      title: `${name} · ${resolved.code ?? "Código"} | MiFicha`,
      description: `Código MiFicha${resolved.code ? ` ${resolved.code}` : ""} · conexiones de academia, visoría y ficha del jugador.`,
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: "Ficha | MiFicha", robots: { index: false } };
  }
}

export default async function TutorShareFichaPage({ params }: PageProps) {
  const { token } = await params;
  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    notFound();
  }

  // Mutating get for tutor so codes/backfill stay warm; resolve uses peek + maps.
  await getTutorChildByShareToken(admin, token);
  const resolution = await resolvePublicCode(admin, token);
  if (!resolution) notFound();

  const child = resolution.child;
  const access = resolution.access;
  const sharePath = tutorSharePath(access);
  const absoluteUrl = buildTutorShareAbsoluteUrl(access);
  const playerName =
    child?.player_name ||
    resolution.player?.displayName ||
    resolution.visoria?.playerName ||
    "Jugador";

  if (!child) {
    return (
      <div className="flex min-h-dvh flex-col bg-mf-canvas">
        <TutorFichaViewTracker token={access || token} />
        <SiteHeader actionHref="/fut/tutor" actionLabel="Soy tutor" />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
          <PublicCodeStub resolution={resolution} />
          <PlayerCodeConnections resolution={resolution} className="mt-5" />
          <p className="mt-6 text-center text-xs leading-6 text-mf-text-muted">
            Un código abre ficha, academia y visorías cuando existen ·{" "}
            <Link href="/fut/tutor" className="font-semibold text-mf-gph hover:underline">
              Entrar como tutor
            </Link>
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const materials = await listTutorMaterials(admin, child);
  const seasons = await listTutorSeasons(admin, child);
  const performance = await fetchTutorLinkedPerformance(admin, child);

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <TutorFichaViewTracker token={access || token} />
      <SiteHeader actionHref="/fut/tutor" actionLabel="Soy tutor" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <TutorPublicFicha
          child={child}
          materials={materials}
          performance={performance}
          seasons={seasons}
        />
        <PlayerCodeConnections resolution={resolution} className="mt-5" />
        <div className="mt-5">
          <TutorShareActions
            playerName={playerName}
            sharePath={sharePath}
            absoluteUrl={absoluteUrl}
            publicCode={child.public_code}
          />
        </div>
        {!performance?.gph ? (
          <DiagnosisHireCard playerName={playerName} className="mt-5" compact />
        ) : null}
        <p className="mt-6 text-center text-xs leading-6 text-mf-text-muted print:hidden">
          Ficha armada por el tutor
          {performance
            ? " · incluye rendimiento de academia ligada"
            : seasons.length
              ? " · con rendimiento capturado por la familia"
              : ""}
          {" · "}
          <Link href="/fut/tutor" className="font-semibold text-mf-gph hover:underline">
            Crear la tuya
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
