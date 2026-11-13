import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { DiagnosisHireCard } from "@/components/public/diagnosis-hire-card";
import { PlayerCodeConnections } from "@/components/tutor/player-code-connections";
import { PublicCodeStub } from "@/components/tutor/public-code-stub";
import { TutorFichaViewTracker } from "@/components/tutor/tutor-ficha-view-tracker";
import { TutorPublicFicha } from "@/components/tutor/tutor-public-ficha";
import { PlayerModeCard } from "@/components/tutor/player-mode-card";
import { FichaLockedTeaser } from "@/components/marketing/explore-paywall";
import { TutorShareActions } from "@/components/tutor/tutor-share-actions";
import {
  buildOgTutorImageAlt,
  buildOgTutorSharePayload,
  buildTutorShareAbsoluteUrl,
} from "@/lib/og-tutor-share";
import { formatPlayerCategory } from "@/lib/player-category";
import { playerModeSharePath } from "@/lib/player-mode";
import { resolvePublicCode } from "@/lib/public-code-resolve";
import { resolveExploreAccess } from "@/lib/scout-access";
import { fetchTutorLinkedPerformance } from "@/lib/tutor-linked-performance";
import {
  agentMaterialsAccess,
  agentMaterialsPath,
} from "@/lib/agent-materials";
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
  searchParams: Promise<{ vista?: string | string[] }>;
}

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
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

export default async function TutorShareFichaPage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params;
  const vista = firstParam((await searchParams).vista).toLowerCase();
  const playerVista = vista === "jugador" || vista === "carta";
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

  const accessGate = await resolveExploreAccess({
    ownerUserId: child.guardian_user_id,
  });

  if (!accessGate.unlocked) {
    const place = [child.profile.club || child.profile.school, child.profile.city]
      .filter(Boolean)
      .join(" · ");
    const loginHref = `/fut/login?next=${encodeURIComponent(sharePath)}`;
    return (
      <div className="flex min-h-dvh flex-col bg-mf-canvas">
        <TutorFichaViewTracker token={access || token} />
        <SiteHeader actionHref="/fut/tutor" actionLabel="Mis fichas" />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
          <FichaLockedTeaser
            name={playerName}
            position={child.profile.position}
            category={formatPlayerCategory(child.profile.birth_date)}
            place={place || null}
            code={child.public_code}
            loginHref={loginHref}
            returnPath={sharePath}
            loggedIn={Boolean(accessGate.userId)}
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

  const materials = await listTutorMaterials(admin, child);
  const seasons = await listTutorSeasons(admin, child);
  const performance = await fetchTutorLinkedPerformance(admin, child);
  const playerSharePath = playerModeSharePath(sharePath);
  const playerModeAbsoluteUrl = (() => {
    try {
      const url = new URL(absoluteUrl);
      url.searchParams.set("vista", "jugador");
      return url.toString();
    } catch {
      return `${absoluteUrl}${absoluteUrl.includes("?") ? "&" : "?"}vista=jugador`;
    }
  })();

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <TutorFichaViewTracker token={access || token} />
      <SiteHeader actionHref="/fut/tutor" actionLabel="Soy tutor" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {!playerVista ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
            <p className="text-sm text-mf-text-secondary">
              Empieza por la carta — así la ve un jugador.
            </p>
            <Link
              href={playerSharePath}
              className="text-sm font-semibold text-mf-gph hover:underline"
            >
              Solo modo jugador
            </Link>
          </div>
        ) : (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
            <p className="text-sm font-semibold text-mf-gph-ink">Modo jugador</p>
            <Link
              href={sharePath}
              className="text-sm font-semibold text-mf-gph hover:underline"
            >
              Ver ficha completa
            </Link>
          </div>
        )}

        <PlayerModeCard
          child={child}
          materials={materials}
          seasons={seasons}
          performance={performance}
          shareHref={playerSharePath}
          absoluteShareUrl={playerModeAbsoluteUrl}
        />

        <div className="mt-5">
          <TutorShareActions
            playerName={playerName}
            sharePath={playerSharePath}
            absoluteUrl={playerModeAbsoluteUrl}
            publicCode={child.public_code}
            materialsKitHref={
              playerVista
                ? null
                : agentMaterialsPath(agentMaterialsAccess(child))
            }
          />
        </div>

        {!playerVista ? (
          <>
            <div className="mt-8 border-t border-mf-border-subtle pt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-text-muted">
                Detalle completo
              </p>
              <h2 className="mt-1 text-lg font-semibold text-mf-gph-ink">
                Para tutores y visores
              </h2>
              <div className="mt-4">
                <TutorPublicFicha
                  child={child}
                  materials={materials}
                  performance={performance}
                  seasons={seasons}
                />
              </div>
            </div>
            <PlayerCodeConnections resolution={resolution} className="mt-5" />
            {!performance?.gph ? (
              <DiagnosisHireCard playerName={playerName} className="mt-5" compact />
            ) : null}
          </>
        ) : null}

        <p className="mt-6 text-center text-xs leading-6 text-mf-text-muted print:hidden">
          {playerVista
            ? "Tu carta en MiFicha · pídele a tu tutor completar las misiones"
            : "Ficha armada por el tutor"}
          {!playerVista && performance
            ? " · incluye rendimiento de academia ligada"
            : !playerVista && seasons.length
              ? " · con rendimiento capturado por el tutor"
              : ""}
          {" · "}
          <Link href="/fut/tutor" className="font-semibold text-mf-gph hover:underline">
            {playerVista ? "Entrar con tu tutor" : "Crear la tuya"}
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
