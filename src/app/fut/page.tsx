import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { HomeAnnouncementsRail } from "@/components/marketing/home-announcements-rail";
import { HomeCtaBand } from "@/components/marketing/home-cta-band";
import { HomeTalentSearch } from "@/components/marketing/home-talent-search";
import { HomeHowItWorks } from "@/components/marketing/home-how-it-works";
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
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

        <section className="border-b border-mf-border bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                Productos GPH
              </p>
              <h2 className="mt-1 text-xl font-semibold text-mf-gph-ink">
                Evaluaciones y entrenamientos
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-mf-text-secondary">
                La plataforma es gratis. El valor de pago está en diagnóstico y clase
                muestra GPH.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              <Link
                href="/fut/explorar#mapa"
                className="mf-btn-gph-ghost w-full justify-center sm:w-auto"
              >
                Mapa de talento
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/fut/productos"
                className="mf-btn-gph w-full justify-center sm:w-auto"
              >
                Ver productos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <HomeOrganizersInvite />
        <HomeGphAllianceBand />
        <HomeHowItWorks />
        <HomeCtaBand />
      </main>

      <SiteFooter />
    </div>
  );
}
