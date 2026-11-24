import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/marketing/site-header";
import { MiEquipoSaveButton } from "@/components/tutor/mi-equipo-panel";
import { PublicCodeStub } from "@/components/tutor/public-code-stub";
import { TutorFichaViewTracker } from "@/components/tutor/tutor-ficha-view-tracker";
import { TutorPublicFicha } from "@/components/tutor/tutor-public-ficha";
import { TutorShareActions } from "@/components/tutor/tutor-share-actions";
import {
  buildOgTutorImageAlt,
  buildOgTutorSharePayload,
  buildTutorShareAbsoluteUrl,
} from "@/lib/og-tutor-share";
import { formatPublicLockedName } from "@/lib/privacy";
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
import {
  fetchTutorLinkedAcademyContact,
  resolveTutorPublicContact,
} from "@/lib/tutor-public-contact";
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
      const publicName = formatPublicLockedName(child.player_name);
      const title = `${publicName} · Ficha | MiFicha`;
      const description =
        bits.length > 0
          ? `Ficha de ${publicName}: ${bits.join(" · ")}. MiFicha.`
          : `Ficha de ${publicName} en MiFicha.`;
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
      description: `Código MiFicha${resolved.code ? ` ${resolved.code}` : ""}.`,
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
        <SiteHeader
          actionHref="/fut/entrar?next=/fut/tutor"
          actionLabel="Armar la mía"
          showAcademyLink={false}
          minimal
        />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
          <PublicCodeStub resolution={resolution} />
          <p className="mt-6 text-center text-sm">
            <Link
              href="/fut/entrar?next=/fut/tutor"
              className="font-semibold text-mf-gph hover:underline"
            >
              Crear la mía
            </Link>
          </p>
        </main>
        <footer className="border-t border-mf-border py-4 text-center text-xs text-mf-text-muted">
          <Link href="/fut" className="font-semibold text-mf-brand hover:underline">
            mificha.mx
          </Link>
        </footer>
      </div>
    );
  }

  const accessGate = await resolveExploreAccess({
    ownerUserId: child.guardian_user_id,
  });

  const materials = await listTutorMaterials(admin, child);
  const seasons = await listTutorSeasons(admin, child);
  const performance = await fetchTutorLinkedPerformance(admin, child);
  const academyContact =
    accessGate.unlocked && child.profile.show_contact_academy
      ? await fetchTutorLinkedAcademyContact(admin, child.linked_academy_id)
      : null;
  const contact = accessGate.unlocked
    ? resolveTutorPublicContact(child, academyContact)
    : null;

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <TutorFichaViewTracker token={access || token} />
      <SiteHeader
        actionHref="/fut/entrar?next=/fut/tutor"
        actionLabel="Armar la mía"
        showAcademyLink={false}
        minimal
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <TutorPublicFicha
          child={child}
          materials={materials}
          performance={performance}
          seasons={seasons}
          shareHref={sharePath}
          absoluteShareUrl={absoluteUrl}
          contact={contact}
        />

        <div className="mt-5">
          <TutorShareActions
            playerName={playerName}
            sharePath={sharePath}
            absoluteUrl={absoluteUrl}
            publicCode={child.public_code}
            materialsKitHref={
              accessGate.unlocked
                ? agentMaterialsPath(agentMaterialsAccess(child))
                : null
            }
          />
        </div>

        {child.public_code ? (
          <div className="mt-3 flex justify-center print:hidden">
            <MiEquipoSaveButton code={child.public_code} name={playerName} />
          </div>
        ) : null}

        <p className="mt-6 text-center text-sm print:hidden">
          <Link
            href={`/fut/entrar?next=${encodeURIComponent("/fut/tutor#fin-de-semana")}`}
            className="font-semibold text-mf-gph hover:underline"
          >
            Actualizar mi ficha
          </Link>
          {" · "}
          <Link
            href="/fut/entrar?next=/fut/tutor"
            className="font-semibold text-mf-gph hover:underline"
          >
            Crear la mía
          </Link>
        </p>
      </main>
      <footer className="border-t border-mf-border py-4 text-center text-xs text-mf-text-muted print:hidden">
        <Link href="/fut" className="font-semibold text-mf-brand hover:underline">
          mificha.mx
        </Link>
      </footer>
    </div>
  );
}
