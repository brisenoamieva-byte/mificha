import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getTalentIndex } from "@/lib/talent-geo-pages";
import { stateSlug } from "@/lib/viral-share";
import { emptyTalentGeoHeat } from "@/lib/talent-geo";

export const metadata: Metadata = {
  title: "Talento por estado | MiFicha",
  description:
    "Índice agregado de fichas de futbolistas amateurs en México por estado y ciudad. Publica con consentimiento del tutor.",
};

export default async function TalentoIndexPage() {
  let heat = emptyTalentGeoHeat();
  try {
    const admin = createSupabaseAdminClient();
    heat = await getTalentIndex(admin);
  } catch {
    /* empty */
  }

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader
        actionHref="/fut/entrar?next=/fut/tutor"
        actionLabel="Armar ficha"
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Base de jugadores · México
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-mf-gph-ink">
          Talento por estado
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          Conteos agregados (sin datos personales).{" "}
          <span className="tabular-nums font-semibold text-mf-gph-ink">
            {heat.totalFichas}
          </span>{" "}
          fichas en {heat.stateCount} estados. Para salir en Explorar hace falta
          consentimiento del tutor.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/fut/entrar?next=/fut/tutor&utm_source=talento&utm_medium=index&utm_campaign=crear_ficha"
            className="mf-btn-gph"
          >
            Publicar ficha con consentimiento
          </Link>
          <Link href="/fut/explorar#mapa" className="mf-btn-gph-ghost">
            Ver mapa
          </Link>
        </div>

        <ul className="mt-10 divide-y divide-mf-border rounded-2xl border border-mf-border bg-white">
          {heat.states.map((row) => (
            <li key={row.state}>
              <Link
                href={`/fut/talento/${stateSlug(row.state)}`}
                className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm transition hover:bg-mf-canvas"
              >
                <span className="font-semibold text-mf-gph-ink">{row.state}</span>
                <span className="tabular-nums text-mf-text-secondary">
                  {row.count} ficha{row.count === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
          {heat.states.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-mf-text-secondary">
              Aún no hay ubicaciones. Sé el primero en publicar.
            </li>
          ) : null}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
