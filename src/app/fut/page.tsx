import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { HomeAudienceSection } from "@/components/marketing/home-audience-section";
import { HomeCtaBand } from "@/components/marketing/home-cta-band";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeHowItWorks } from "@/components/marketing/home-how-it-works";
import { HomeGphAllianceBand } from "@/components/marketing/evaluaciones-page-content";
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
      <p className="border-b border-mf-brand/15 bg-mf-brand-soft px-4 py-2.5 text-center text-sm text-mf-brand-dark">
        <span className="font-semibold">Próximamente.</span> MiFicha está en construcción.
        Lo que ves es el avance del producto, todavía no la versión abierta.
      </p>

      <main className="flex-1">
        <HomeHero />
        <HomeHowItWorks />
        <HomeGphAllianceBand />
        <HomeAudienceSection />
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
