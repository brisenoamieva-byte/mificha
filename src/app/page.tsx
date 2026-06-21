import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { HomeAudienceSection } from "@/components/marketing/home-audience-section";
import { HomeComplementSection } from "@/components/marketing/home-complement-section";
import { HomeCtaBand } from "@/components/marketing/home-cta-band";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeHowItWorks } from "@/components/marketing/home-how-it-works";
import { HomeTrustSection } from "@/components/marketing/home-trust-section";
import { VerifiedAcademiesShowcase } from "@/components/marketing/verified-academies-showcase";
import { fetchPublicDirectory } from "@/lib/public-directory";

export default async function Home() {
  const { academies, players } = await fetchPublicDirectory();

  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <SiteHeader />

      <main className="flex-1">
        <HomeHero />
        <HomeHowItWorks />
        <HomeTrustSection />
        <HomeAudienceSection />
        {academies.length > 0 ? (
          <VerifiedAcademiesShowcase
            academies={academies}
            playerCount={players.length}
            variant="marquee"
          />
        ) : null}
        <HomeComplementSection />
        <HomeCtaBand />
      </main>

      <SiteFooter />
    </div>
  );
}
