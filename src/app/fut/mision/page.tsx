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
  title: "Qué es MiFicha",
  description:
    "La ficha de tu hijo. Tú la armas, tú decides si sale en Explorar, y se la puedes pasar a los papás por WhatsApp.",
};

export default function MisionPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader
        actionHref="/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=header&utm_campaign=crear_ficha"
        actionLabel="Crear ficha"
      />
      <HashScroll />

      <main className="flex-1">
        <section className="border-b border-mf-border bg-[#0a1f3d]">
          <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300/90">
              Todavía hay pocas fichas
            </p>
            <h1 className="mt-3 text-[1.85rem] font-semibold leading-[1.15] tracking-[-0.03em] text-white sm:text-[2.35rem]">
              La ficha digital de tu hijo
            </h1>
            <p className="mt-4 text-base leading-7 text-white/80">
              Tú armas la ficha, decides si tu hijo sale en Explorar, y se la
              puedes mandar por WhatsApp. Si los papás del equipo hacen lo
              mismo, tu ciudad aparece en el mapa.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Link
                href="/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=hero&utm_campaign=crear_ficha"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-mf-brand transition hover:bg-white/95"
              >
                Crear ficha
              </Link>
              <Link
                href="#como-sumar"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Qué puedes hacer
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-mf-border bg-white">
          <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
            <h2 className="text-xl font-semibold text-mf-gph-ink">
              Lo de hoy
            </h2>
            <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
              Ya puedes armar la ficha de tu hijo y decidir si sale en Explorar.
              Lo que falta es que otros papás del equipo también la publiquen. Si
              firmas ahora, te aparece{" "}
              <strong className="text-mf-gph-ink">{FOUNDER_BADGE_LABEL}</strong>.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {MISION_GOALS.map((goal) => (
                <li
                  key={goal.id}
                  className="rounded-xl border border-mf-border bg-mf-canvas px-4 py-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
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

        <section className="border-b border-mf-border bg-mf-canvas">
          <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
            <h2 className="text-xl font-semibold text-mf-gph-ink">Después</h2>
            <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
              Cuando ya haya fichas, sigue esto:
            </p>
            <ol className="mt-6 space-y-3">
              {MISION_STAGES.map((stage) => (
                <li
                  key={stage.n}
                  className={`rounded-xl border px-4 py-3.5 ${
                    stage.now
                      ? "border-mf-gph/30 bg-white"
                      : "border-mf-border bg-white/70"
                  }`}
                >
                  <p className="text-sm font-semibold text-mf-gph-ink">
                    {stage.n}. {stage.title}
                    {stage.now ? (
                      <span className="ml-2 text-xs font-semibold text-mf-gph">
                        ahora
                      </span>
                    ) : null}
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
          className="scroll-mt-24 border-b border-mf-border bg-white"
        >
          <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
            <h2 className="text-xl font-semibold text-mf-gph-ink">
              Qué puedes hacer
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {MISION_ACTIONS.map((action) => (
                <li
                  key={action.title}
                  className="flex flex-col rounded-xl border border-mf-border bg-mf-canvas px-4 py-4"
                >
                  <h3 className="text-sm font-semibold text-mf-gph-ink">
                    {action.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-mf-text-secondary">
                    {action.body}
                  </p>
                  <Link
                    href={action.href}
                    className="mf-btn-gph mt-4 inline-flex w-full justify-center text-sm"
                  >
                    {action.cta}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center text-sm text-mf-text-secondary">
              Si tienes academia o torneo:{" "}
              <Link
                href="/fut/captacion"
                className="font-semibold text-mf-gph hover:underline"
              >
                captación
              </Link>
              {" · "}
              <Link
                href="/fut/talento"
                className="font-semibold text-mf-gph hover:underline"
              >
                por estado
              </Link>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
