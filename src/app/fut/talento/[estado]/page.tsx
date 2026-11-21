import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  getTalentIndex,
  resolveStateFromSlug,
} from "@/lib/talent-geo-pages";
import { emptyTalentGeoHeat } from "@/lib/talent-geo";
import { stateSlug } from "@/lib/viral-share";

interface PageProps {
  params: Promise<{ estado: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { estado } = await params;
  const state = resolveStateFromSlug(estado);
  if (!state) return { title: "Talento | MiFicha" };
  return {
    title: `Jugadores en ${state} | MiFicha`,
    description: `Fichas agregadas de futbolistas amateurs en ${state}. Publica con consentimiento del tutor y aparece en Explorar.`,
  };
}

export default async function TalentoEstadoPage({ params }: PageProps) {
  const { estado } = await params;
  const state = resolveStateFromSlug(estado);
  if (!state) notFound();

  let heat = emptyTalentGeoHeat();
  try {
    const admin = createSupabaseAdminClient();
    heat = await getTalentIndex(admin);
  } catch {
    /* empty */
  }

  const stateBucket = heat.states.find((row) => row.state === state);
  const cities = heat.cities.filter((row) => row.state === state);

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader
        actionHref="/fut/entrar?next=/fut/tutor"
        actionLabel="Armar ficha"
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mf-gph">
          <Link href="/fut/talento" className="hover:underline">
            Talento
          </Link>{" "}
          · {state}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-mf-gph-ink">
          Futbolistas en {state}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          Hay{" "}
          <span className="tabular-nums font-semibold text-mf-gph-ink">
            {stateBucket?.count ?? 0}
          </span>{" "}
          fichas con ubicación en este estado. Solo las que tienen consentimiento
          del tutor aparecen en Explorar.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/fut/entrar?next=/fut/tutor&utm_source=talento&utm_medium=estado&utm_campaign=${stateSlug(state)}&utm_content=crear_ficha`}
            className="mf-btn-gph"
          >
            Publicar ficha en {state}
          </Link>
          <Link
            href={`/fut/explorar?state=${encodeURIComponent(state)}#mapa`}
            className="mf-btn-gph-ghost"
          >
            Ver en Explorar
          </Link>
          <Link
            href={`/fut/captacion?estado=${encodeURIComponent(state)}`}
            className="mf-btn-gph-ghost"
          >
            Captar academia / torneo
          </Link>
        </div>

        <ul className="mt-10 divide-y divide-mf-border rounded-2xl border border-mf-border bg-white">
          {cities.map((row) => (
            <li
              key={`${row.state}-${row.city}`}
              className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm"
            >
              <span className="font-medium text-mf-text">{row.city}</span>
              <span className="tabular-nums text-mf-text-secondary">
                {row.count}
              </span>
            </li>
          ))}
          {cities.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-mf-text-secondary">
              Aún no hay ciudades con fichas. Sé el primero en {state}.
            </li>
          ) : null}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
