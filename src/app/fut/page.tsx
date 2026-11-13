import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { HomeAnnouncementsRail } from "@/components/marketing/home-announcements-rail";
import { HomeCtaBand } from "@/components/marketing/home-cta-band";
import { HomeTalentSearch } from "@/components/marketing/home-talent-search";
import { HomeHowItWorks } from "@/components/marketing/home-how-it-works";
import { HomeGphAllianceBand } from "@/components/marketing/evaluaciones-page-content";
import { SponsorSlot } from "@/components/marketing/sponsor-slot";
import { countExploreDirectoryPlayers } from "@/lib/explore-demo-data";
import {
  collectBirthDatesFromDirectory,
  getDefaultCategoryFilter,
} from "@/lib/player-category";
import { fetchPublicDirectory } from "@/lib/public-directory";
import { resolveExploreAccess } from "@/lib/scout-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { fetchTutorDirectoryPlayers } from "@/lib/tutor-directory";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
  const directory = {
    ...directoryBase,
    players: [
      ...directoryBase.players,
      ...tutorPlayers.filter((player) => !academySlugs.has(player.slug)),
    ],
  };

  const playerCount = countExploreDirectoryPlayers(directory);
  const initialCategoryFilter = getDefaultCategoryFilter(
    collectBirthDatesFromDirectory(directory.players, []),
  );

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />
      <HomeAnnouncementsRail />
      <SponsorSlot placement="home_strip" />

      <main className="flex-1">
        <HomeTalentSearch
          data={directory}
          access={access}
          playerCount={playerCount}
          initialCategoryFilter={initialCategoryFilter}
        />

        <section className="border-b border-mf-border bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                Planes y productos
              </p>
              <h2 className="mt-1 text-xl font-semibold text-mf-gph-ink">
                Membresías, evaluaciones y entrenamientos
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-mf-text-secondary">
                Cuentas de plataforma y servicios GPH.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/fut/planes" className="mf-btn-gph">
                Ver planes
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/fut/productos" className="mf-btn-gph-ghost">
                Ver productos
              </Link>
            </div>
          </div>
        </section>

        <HomeGphAllianceBand />
        <HomeHowItWorks />
        <HomeCtaBand />
      </main>

      <SiteFooter />
    </div>
  );
}
