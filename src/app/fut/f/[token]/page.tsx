import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { DiagnosisHireCard } from "@/components/public/diagnosis-hire-card";
import { TutorPublicFicha } from "@/components/tutor/tutor-public-ficha";
import { TutorShareActions } from "@/components/tutor/tutor-share-actions";
import { fetchTutorLinkedPerformance } from "@/lib/tutor-linked-performance";
import {
  getTutorChildByShareToken,
  listTutorMaterials,
  listTutorSeasons,
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
    const child = await getTutorChildByShareToken(admin, token);
    if (!child) return { title: "Ficha | MiFicha", robots: { index: false } };
    const bits = [
      child.profile.position,
      child.profile.club,
      child.profile.city,
    ].filter(Boolean);
    return {
      title: `${child.player_name} · Ficha | MiFicha`,
      description:
        bits.length > 0
          ? `Ficha de ${child.player_name}: ${bits.join(" · ")}. Material del tutor, rendimiento y seguimiento en MiFicha.`
          : `Ficha de presentación de ${child.player_name}. Material del tutor en MiFicha.`,
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

  const child = await getTutorChildByShareToken(admin, token);
  if (!child) notFound();
  const materials = await listTutorMaterials(admin, child);
  const seasons = await listTutorSeasons(admin, child);
  const performance = await fetchTutorLinkedPerformance(admin, child);
  const sharePath = tutorSharePath(child.public_code || child.share_token);

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader actionHref="/fut/tutor" actionLabel="Soy tutor" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-4 text-center text-sm text-mf-text-muted print:hidden">
          Ficha armada por el tutor ·{" "}
          <Link href="/fut/tutor" className="font-semibold text-mf-gph hover:underline">
            Crear la tuya
          </Link>
        </p>
        <TutorShareActions
          playerName={child.player_name}
          sharePath={sharePath}
          publicCode={child.public_code}
        />
        <div className="mt-4">
          <TutorPublicFicha
            child={child}
            materials={materials}
            performance={performance}
            seasons={seasons}
          />
        </div>
        {!performance?.gph ? (
          <DiagnosisHireCard playerName={child.player_name} className="mt-6" />
        ) : null}
        <p className="mt-6 text-center text-xs leading-6 text-mf-text-muted print:hidden">
          Material del tutor
          {performance
            ? " · rendimiento de academia ligada y evaluación GPH cuando existen"
            : seasons.length
              ? " · rendimiento capturado por el tutor"
              : " · agrega torneos en tu cuenta o liga la academia"}
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
