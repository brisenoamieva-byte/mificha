import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { OrganizadoresPageHero } from "@/components/marketing/organizadores-page-hero";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { WithBrandName } from "@/components/ui/brand-wordmark";
import { ORGANIZER_ONE_PAGER } from "@/lib/organizer-one-pager";

export const metadata: Metadata = {
  title: "Organizadores de torneo | MiFicha",
  description:
    "Torneos interescolares con calendario oficial, acta verificada y fichas por jugador. MiFicha complementa tu operación en Querétaro.",
};

const CONTACT_EMAIL = "hola@mificha.mx";

export default function OrganizadoresPage() {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Torneo interescolar · MiFicha Querétaro",
  )}`;

  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <SiteHeader />

      <main className="flex-1">
        <OrganizadoresPageHero mailtoHref={mailto} />

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
          <div className="max-w-2xl">
            <p className="mf-marketing-eyebrow">Por qué aliarte</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
              {ORGANIZER_ONE_PAGER.winTitle}
            </h2>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {ORGANIZER_ONE_PAGER.winPoints.map((point) => (
              <li
                key={point.title}
                className="mf-card flex flex-col gap-2 p-5 sm:p-6"
              >
                <p className="text-sm font-semibold text-mf-text">{point.title}</p>
                <p className="text-sm leading-7 text-mf-text-secondary">
                  <WithBrandName>{point.description}</WithBrandName>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-mf-border bg-mf-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <p className="mf-marketing-eyebrow">Operación clara</p>
                <h2 className="mt-3 text-2xl font-semibold text-mf-text">
                  {ORGANIZER_ONE_PAGER.askTitle}
                </h2>
                <ul className="mt-6 space-y-4">
                  {ORGANIZER_ONE_PAGER.askPoints.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-sm leading-7 text-mf-text-secondary"
                    >
                      <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-mf-accent-dark" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mf-marketing-eyebrow">Gobernanza</p>
                <h2 className="mt-3 text-2xl font-semibold text-mf-text">
                  {ORGANIZER_ONE_PAGER.governanceTitle}
                </h2>
                <ul className="mt-6 space-y-3">
                  {ORGANIZER_ONE_PAGER.governancePoints.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-sm leading-7 text-mf-text-secondary"
                    >
                      <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-mf-brand" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
          <div className="mf-card overflow-hidden p-8 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="mf-marketing-eyebrow">Piloto Querétaro</p>
                <h2 className="mt-3 text-2xl font-semibold text-mf-text">
                  Empecemos con una categoría y crecemos contigo
                </h2>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-mf-text-secondary">
                  {ORGANIZER_ONE_PAGER.pilotSteps.map((step) => (
                    <li key={step} className="flex gap-2">
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-mf-accent-dark" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              <a href={mailto} className="mf-btn-primary shrink-0">
                {ORGANIZER_ONE_PAGER.cta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
