import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { FeatureHubSection } from "@/components/marketing/feature-hub-section";
import { HomeAudienceSection } from "@/components/marketing/home-audience-section";
import { HomeCtaBand } from "@/components/marketing/home-cta-band";
import { HomeHero } from "@/components/marketing/home-hero";
import { VerifiedAcademiesShowcase } from "@/components/marketing/verified-academies-showcase";
import { fetchPublicDirectory } from "@/lib/public-directory";

export default async function Home() {
  const { academies, players } = await fetchPublicDirectory();

  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <SiteHeader />

      <main className="flex-1">
        <HomeHero />
        <VerifiedAcademiesShowcase
          academies={academies}
          playerCount={players.length}
          variant="feature"
        />
        <HomeAudienceSection />
        <FeatureHubSection />
        <HomeCtaBand />
      </main>

      <SiteFooter />
    </div>
  );
}
