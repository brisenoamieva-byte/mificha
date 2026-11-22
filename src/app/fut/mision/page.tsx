import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { HashScroll } from "@/components/marketing/hash-scroll";
import {
  FOUNDER_BADGE_LABEL,
  MISION_ACTIONS,
  MISION_GOALS,
  MISION_STAGES,
} from "@/lib/mision";

export const metadata: Metadata = {
  title: "Misión · catálogo nacional | MiFicha",
  description:
    "MiFicha está en la etapa fundacional: construir con familias y academias el catálogo más importante de jugadores amateurs de México.",
};

export default function MisionPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader
        actionHref="/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=header&utm_campaign=crear_ficha"
        actionLabel="Sumar ficha"
      />
      <HashScroll />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-mf-border bg-[#0a1f3d]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_20%_0%,rgba(52,211,153,0.16),transparent_55%),linear-gradient(180deg,rgba(10,31,61,0.2),rgba(10,31,61,0.95))]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/90">
              Etapa fundacional · 2026
            </p>
            <h1 className="mt-3 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[2.6rem]">
              El catálogo nacional lo armamos juntos
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              MiFicha no es solo una app: es la red de fichas, datos objetivos y visibilidad
              para el futbol amateur de México. Tu ficha es tuya; la plataforma crece con
              cada familia, academia y torneo que suma.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=hero&utm_campaign=crear_ficha"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-mf-brand transition hover:bg-white/95"
              >
                Publicar mi ficha
              </Link>
              <Link
                href="#como-sumar"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Cómo sumar
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-mf-border bg-white">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Qué es
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink">
              Competitividad, talento y datos confiables
            </h2>
            <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
              Buscamos ser el catálogo más importante de jugadores amateurs en México:
              promover el deporte y la educación, descubrir talento con información
              objetiva, y abrir puertas con evidencia — no con rumor. Eso solo existe si
              las familias publican con consentimiento y las academias/torneos conectan.
            </p>
            <p className="mt-4 rounded-xl border border-mf-gph/20 bg-mf-gph-soft px-4 py-3 text-sm leading-6 text-mf-gph-ink">
              Quienes firman Explorar en esta etapa reciben el reconocimiento{" "}
              <strong>{FOUNDER_BADGE_LABEL}</strong>: ayudaron a poner el cimiento.
            </p>
          </div>
        </section>

        <section className="border-b border-mf-border bg-mf-canvas">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Etapa actual
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink">
              Meta: densificar la base nacional
            </h2>
            <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
              Todavía estamos al inicio. El objetivo de esta fase no es “parecer grandes”:
              es llegar a una base suficiente para que Explorar, el mapa y los scouts
              tengan densidad real.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {MISION_GOALS.map((goal) => (
                <li
                  key={goal.id}
                  className="rounded-2xl border border-mf-border bg-white px-4 py-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
                    {goal.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-mf-gph-ink">
                    {goal.target}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-mf-text-secondary">
                    {goal.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b border-mf-border bg-white">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Camino
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink">
              Etapas de la red
            </h2>
            <ol className="mt-8 space-y-4">
              {MISION_STAGES.map((stage) => (
                <li
                  key={stage.n}
                  className={`rounded-2xl border px-4 py-4 ${
                    stage.now
                      ? "border-mf-gph/30 bg-mf-gph-soft"
                      : "border-mf-border bg-mf-canvas"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-gph">
                    Etapa {stage.n}
                    {stage.now ? " · ahora" : ""}
                  </p>
                  <p className="mt-1 text-base font-semibold text-mf-gph-ink">
                    {stage.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
                    {stage.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="como-sumar"
          className="scroll-mt-24 border-b border-mf-border bg-mf-canvas"
        >
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Cómo participar
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink">
              Tres actos que hacen crecer la red
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {MISION_ACTIONS.map((action) => (
                <li
                  key={action.title}
                  className="flex flex-col rounded-2xl border border-mf-border bg-white px-4 py-5"
                >
                  <h3 className="text-base font-semibold text-mf-gph-ink">
                    {action.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-mf-text-secondary">
                    {action.body}
                  </p>
                  <Link href={action.href} className="mf-btn-gph mt-4 inline-flex w-full justify-center">
                    {action.cta}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center text-sm text-mf-text-secondary">
              ¿Academia o torneo?{" "}
              <Link href="/fut/captacion" className="font-semibold text-mf-gph hover:underline">
                Plantillas de captación
              </Link>{" "}
              ·{" "}
              <Link href="/fut/talento" className="font-semibold text-mf-gph hover:underline">
                Talento por estado
              </Link>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
