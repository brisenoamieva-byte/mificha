import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { TutorPublicFicha } from "@/components/tutor/tutor-public-ficha";
import {
  getTutorChildByShareToken,
  listTutorMaterials,
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
    return {
      title: `${child.player_name} · Ficha | MiFicha`,
      description: `Ficha de presentación de ${child.player_name}. Material del tutor en MiFicha.`,
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
        <TutorPublicFicha child={child} materials={materials} />
        <p className="mt-6 text-center text-xs leading-6 text-mf-text-muted print:hidden">
          Esta ficha reúne el material que el tutor eligió compartir. No es una
          evaluación GPH ni un acta oficial de torneo.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
