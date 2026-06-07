import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { ParentLinkForm } from "@/components/marketing/parent-link-form";

export const metadata: Metadata = {
  title: "Padres y jugadores | MiFicha",
  description:
    "Abre la ficha técnica de tu hijo con el link o QR de su academia. Sin cuenta necesaria.",
};

export default function PadresPage() {
  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <SiteHeader actionHref="/padres" actionLabel="Padres" />

      <main className="flex-1">
        <section className="border-b border-mf-border bg-mf-surface">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <p className="mf-section-kicker">Soy padre o jugador</p>
            <h1 className="mt-2 mf-page-title">
              ¿Tienes el link de tu hijo?
            </h1>
            <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
              No necesitas crear cuenta. La academia te comparte un enlace o QR
              para ver stats verificados, Passport Score y el historial de tu hijo.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <ParentLinkForm />
        </section>

        <section className="border-t border-mf-border bg-mf-surface">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <h2 className="mf-section-title">Ejemplo de ficha pública</h2>
            <p className="mt-2 text-sm text-mf-text-secondary">
              Así se ve una ficha cuando la academia la tiene activa.
            </p>

            <div className="mf-card-elevated mt-6 overflow-hidden">
              <div className="border-b border-mf-border-subtle px-5 py-4">
                <p className="text-sm font-semibold text-mf-text">
                  Ficha verificada · Santiago H.
                </p>
                <p className="text-sm text-mf-text-secondary">
                  Delantero · Passport 78 · Academia Norteños
                </p>
              </div>
              <div className="grid grid-cols-3 gap-px bg-mf-border-subtle">
                {[
                  { label: "Partidos", value: "12" },
                  { label: "Goles", value: "9" },
                  { label: "Asist.", value: "4" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-mf-surface px-4 py-5 text-center">
                    <p className="text-2xl font-semibold tabular-nums text-mf-text">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-mf-text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-5">
                <Link href="/explorar" className="text-sm font-semibold text-mf-brand hover:underline">
                  Ver jugadores públicos en el directorio →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
