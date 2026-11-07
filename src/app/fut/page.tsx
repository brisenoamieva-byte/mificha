import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { HomeCtaBand } from "@/components/marketing/home-cta-band";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeHowItWorks } from "@/components/marketing/home-how-it-works";
import { HomeGphAllianceBand } from "@/components/marketing/evaluaciones-page-content";
import { AccountTypesSection } from "@/components/marketing/account-types-section";
import { FichaTypesSection } from "@/components/marketing/ficha-types-section";
import { MembershipOfferSection } from "@/components/marketing/membership-offer-section";
import { OpportunitiesSection } from "@/components/marketing/opportunities-section";
import { VerifiedAcademiesShowcase } from "@/components/marketing/verified-academies-showcase";
import {
  buildHomeShowcaseAcademies,
  countExploreDirectoryPlayers,
} from "@/lib/explore-demo-data";
import { fetchPublicDirectory } from "@/lib/public-directory";

export default async function Home() {
  const directory = await fetchPublicDirectory();
  const showcaseAcademies = buildHomeShowcaseAcademies(directory);
  const playerCount = countExploreDirectoryPlayers(directory);

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />
      <div className="border-b border-mf-brand/15 bg-mf-brand-soft px-4 py-3 text-center text-sm text-mf-brand-dark sm:px-6">
        <p>
          <span className="font-semibold">Piloto abierto.</span> Los tutores ya pueden
          armar la ficha de su hijo (fotos, videos e historia) sin cobro.{" "}
          <a href="/fut/tutor" className="font-semibold underline underline-offset-2">
            Entrar como tutor
          </a>
        </p>
        <p className="mt-1">
          <span className="font-semibold text-mf-gph">Diagnósticos GPH: ya disponibles.</span>{" "}
          Se agendan por WhatsApp.{" "}
          <a href="#diagnosticos-gph" className="font-semibold underline underline-offset-2">
            Ver cómo contratar
          </a>
        </p>
      </div>

      <main className="flex-1">
        <HomeHero />
        <AccountTypesSection />
        <FichaTypesSection />
        <MembershipOfferSection />
        <OpportunitiesSection />
        <HomeHowItWorks />
        <HomeGphAllianceBand />
        <VerifiedAcademiesShowcase
          academies={showcaseAcademies}
          playerCount={playerCount}
          variant="marquee"
        />
        <HomeCtaBand />
      </main>

      <SiteFooter />
    </div>
  );
}
