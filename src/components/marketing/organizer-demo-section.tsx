import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { ORGANIZER_ONE_PAGER } from "@/lib/organizer-one-pager";

export function OrganizerDemoSection() {
  const { demoMatch } = ORGANIZER_ONE_PAGER;

  return (
    <section className="border-b border-mf-border bg-mf-canvas">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Cómo funciona</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
            {ORGANIZER_ONE_PAGER.demoTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-mf-text-secondary sm:text-base">
            {ORGANIZER_ONE_PAGER.demoSubtitle}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
          <article className="rounded-xl border border-mf-border bg-white p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-mf-brand">
              {demoMatch.league}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-mf-text">
              vs {demoMatch.opponent}
            </h3>
            <p className="mt-1 text-sm text-mf-text-secondary">
              {demoMatch.category} · {demoMatch.jornada}
            </p>
            <dl className="mt-4 space-y-2 text-sm text-mf-text-secondary">
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-mf-brand" aria-hidden />
                <dd>{demoMatch.date}</dd>
              </div>
              <dd className="pl-6">{demoMatch.venue}</dd>
            </dl>
          </article>

          <div className="flex flex-col gap-5">
            <ol className="space-y-3">
              {ORGANIZER_ONE_PAGER.demoSteps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-7 text-mf-text-secondary">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mf-brand-soft text-xs font-semibold text-mf-brand">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-3">
              <Link href={ORGANIZER_ONE_PAGER.demoFichaHref} className="mf-btn-primary">
                Ver ficha de ejemplo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={ORGANIZER_ONE_PAGER.demoExploreHref} className="mf-btn-accent">
                Ver red en Explorar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
