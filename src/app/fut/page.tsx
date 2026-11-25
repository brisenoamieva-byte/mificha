import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { HomeAnnouncementsRail } from "@/components/marketing/home-announcements-rail";
import { HomeCtaBand } from "@/components/marketing/home-cta-band";
import { HomeTalentSearch } from "@/components/marketing/home-talent-search";
import { HomeHowItWorks } from "@/components/marketing/home-how-it-works";
import { HomeDiagnosisBand } from "@/components/marketing/home-diagnosis-band";
import { HomeGphAllianceBand } from "@/components/marketing/evaluaciones-page-content";
import { HomeOrganizersInvite } from "@/components/marketing/home-organizers-invite";
import { HashScroll } from "@/components/marketing/hash-scroll";
import { ProductAnalyticsBeacon } from "@/components/marketing/product-analytics-beacon";
import { countExploreDirectoryPlayers } from "@/lib/explore-demo-data";
import {
  fetchPublicDirectory,
  sanitizeDirectoryForLockedView,
} from "@/lib/public-directory";
import { resolveExploreAccess } from "@/lib/scout-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { fetchTutorDirectoryPlayers } from "@/lib/tutor-directory";

export const metadata: Metadata = {
  title: {
    absolute: "MiFicha · Ficha de futbol para familias y academias",
  },
  description:
    "Crea la ficha de tu jugador, publica con consentimiento del tutor y encuentra visorías, academias y diagnóstico GPH en México.",
  alternates: {
    canonical: "/fut",
  },
  openGraph: {
    title: "MiFicha · Ficha de futbol para familias y academias",
    description:
      "Crea la ficha de tu jugador, publica con consentimiento del tutor y encuentra visorías, academias y diagnóstico GPH en México.",
    url: "/fut",
  },
};

export default async function Home() {
  const [directoryBase, tutorPlayers, access] = await Promise.all([
    fetchPublicDirectory().catch(() => ({ academies: [], players: [] })),
    (async () => {
      try {
        const admin = createSupabaseAdminClient();
        return await fetchTutorDirectoryPlayers(admin);
      } catch {
        return [];
      }
    })(),
    resolveExploreAccess(),
  ]);

  const academySlugs = new Set(directoryBase.players.map((player) => player.slug));
  const fullDirectory = {
    ...directoryBase,
    players: [
      ...directoryBase.players,
      ...tutorPlayers.filter((player) => !academySlugs.has(player.slug)),
    ],
  };
  const directory = access.unlocked
    ? fullDirectory
    : sanitizeDirectoryForLockedView(fullDirectory);

  const playerCount = countExploreDirectoryPlayers(fullDirectory);
  const initialCategoryFilter = "all";

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />
      <HashScroll />
      <ProductAnalyticsBeacon event="view_home" />

      <main className="flex-1">
        <HomeTalentSearch
          data={directory}
          access={access}
          playerCount={playerCount}
          initialCategoryFilter={initialCategoryFilter}
        />
        {/* Anuncios después del hero: la marca/misión abren la página */}
        <HomeAnnouncementsRail />

        {/* Único producto de pago: visible temprano, con precio */}
        <HomeDiagnosisBand />

        <HomeOrganizersInvite />
        <HomeGphAllianceBand />
        <HomeHowItWorks />
        <HomeCtaBand />
      </main>

      <SiteFooter />
    </div>
  );
}
