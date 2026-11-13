import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentMaterialsToolbar } from "@/components/agente/agent-materials-toolbar";
import { FichaLockedTeaser } from "@/components/marketing/explore-paywall";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { TutorPublicFicha } from "@/components/tutor/tutor-public-ficha";
import {
  agentMaterialsAccess,
  agentMaterialsPath,
  digitalFichaPath,
} from "@/lib/agent-materials";
import { formatPlayerCategory } from "@/lib/player-category";
import { resolveExploreAccess } from "@/lib/scout-access";
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
    if (!child) return { title: "Ficha PDF | MiFicha", robots: { index: false } };
    return {
      title: `${child.player_name} · Ficha PDF | MiFicha`,
      description: `Ficha imprimible de ${child.player_name}.`,
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: "Ficha PDF | MiFicha", robots: { index: false } };
  }
}

export default async function AgentMaterialsPage({ params }: PageProps) {
  const { token } = await params;
  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    notFound();
  }

  const child = await getTutorChildByShareToken(admin, token);
  if (!child) notFound();

  const gate = await resolveExploreAccess({ ownerUserId: child.guardian_user_id });
  if (!gate.unlocked) {
    const place = [child.profile.club || child.profile.school, child.profile.city]
      .filter(Boolean)
      .join(" · ");
    const kitPath = agentMaterialsPath(agentMaterialsAccess(child));
    const loginHref = `/fut/login?next=${encodeURIComponent(kitPath)}`;
    const loggedIn = Boolean(gate.userId);
    return (
      <div className="flex min-h-dvh flex-col bg-mf-canvas">
        <SiteHeader actionHref="/fut/tutor" actionLabel="Mis fichas" />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
          <FichaLockedTeaser
            name={child.player_name}
            position={child.profile.position}
            category={formatPlayerCategory(child.profile.birth_date)}
            place={place || null}
            code={child.public_code}
            loginHref={loginHref}
            returnPath={kitPath}
            loggedIn={loggedIn}
          />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const [materials, seasons] = await Promise.all([
    listTutorMaterials(admin, child),
    listTutorSeasons(admin, child),
  ]);

  const access = agentMaterialsAccess(child);
  const fichaPath = digitalFichaPath(child);

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <div className="print:hidden">
        <SiteHeader actionHref="/fut/tutor" actionLabel="Mis fichas" />
      </div>
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="print:hidden">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Espacio agente
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink">
            Ficha de {child.player_name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-mf-text-secondary">
            Vista imprimible de la ficha. El link digital sigue en{" "}
            <Link href={tutorSharePath(access)} className="font-semibold text-mf-gph hover:underline">
              {fichaPath}
            </Link>
            .
          </p>
          <p className="mt-2 text-sm text-mf-text-muted">
            <Link href="/fut/tutor" className="font-semibold text-mf-gph hover:underline">
              ← Volver a Mis fichas
            </Link>
          </p>
        </div>

        <AgentMaterialsToolbar playerName={child.player_name} />

        <section className="agent-kit-ficha space-y-3">
          <h2 className="print:hidden text-sm font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            Ficha presentable
          </h2>
          <TutorPublicFicha child={child} materials={materials} seasons={seasons} />
        </section>
      </main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}
