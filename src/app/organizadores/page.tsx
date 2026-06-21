import type { Metadata } from "next";
import { ArrowRight, Trophy } from "lucide-react";
import { OrganizadoresPageHero } from "@/components/marketing/organizadores-page-hero";
import { OrganizerAcademyKit } from "@/components/marketing/organizer-academy-kit";
import { OrganizerDemoSection } from "@/components/marketing/organizer-demo-section";
import { OrganizerPricingSection } from "@/components/marketing/organizer-pricing-section";
import { OrganizerTrustSection } from "@/components/marketing/organizer-trust-section";
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
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />

      <main className="flex-1">
        <OrganizadoresPageHero mailtoHref={mailto} />

        <OrganizerDemoSection />

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

        <OrganizerPricingSection mailtoHref={mailto} />

        <OrganizerTrustSection />

        <OrganizerAcademyKit />

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
      </main>

      <SiteFooter />
    </div>
  );
}
