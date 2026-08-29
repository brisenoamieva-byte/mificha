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
