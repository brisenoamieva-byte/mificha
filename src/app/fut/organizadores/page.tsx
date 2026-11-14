import type { Metadata } from "next";
import { ArrowRight, Trophy } from "lucide-react";
import { OrganizadoresPageHero } from "@/components/marketing/organizadores-page-hero";
import { OrganizerAcademyKit } from "@/components/marketing/organizer-academy-kit";
import { OrganizerDemoSection } from "@/components/marketing/organizer-demo-section";
import { OrganizerPricingSection } from "@/components/marketing/organizer-pricing-section";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { ORGANIZER_ONE_PAGER } from "@/lib/organizer-one-pager";

export const metadata: Metadata = {
  title: "Organizadores de torneo | MiFicha",
  description:
    "Registra tu torneo gratis en MiFicha: calendario oficial, acta verificada y fichas por jugador en Querétaro.",
};

export default function OrganizadoresPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />

      <main className="flex-1">
        <OrganizadoresPageHero />
        <OrganizerDemoSection />
        <OrganizerPricingSection />

        <section className="border-t border-mf-border bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <p className="mf-marketing-eyebrow">Para arrancar</p>
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
                <p className="mf-marketing-eyebrow">Roles</p>
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

            <OrganizerAcademyKit embedded />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
