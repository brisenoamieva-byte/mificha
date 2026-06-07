import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { FeatureHubSection } from "@/components/marketing/feature-hub-section";
import { HomeAudienceSection } from "@/components/marketing/home-audience-section";
import { HomeCtaBand, HomeLaunchBanner } from "@/components/marketing/home-cta-band";
import { HomeHero } from "@/components/marketing/home-hero";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <SiteHeader />

      <main className="flex-1">
        <HomeLaunchBanner />
        <HomeHero />
        <HomeAudienceSection />
        <FeatureHubSection />
        <HomeCtaBand />
      </main>

      <SiteFooter />
    </div>
  );
}
