import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { HomeAnnouncementsRail } from "@/components/marketing/home-announcements-rail";
import { HomeCtaBand } from "@/components/marketing/home-cta-band";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeHowItWorks } from "@/components/marketing/home-how-it-works";
import { HomeGphAllianceBand } from "@/components/marketing/evaluaciones-page-content";
import { AccountTypesSection } from "@/components/marketing/account-types-section";
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
      <HomeAnnouncementsRail />

      <main className="flex-1">
        <HomeHero />
        <AccountTypesSection />
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
