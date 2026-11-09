import type { Metadata } from "next";
import { ExplorePageHero } from "@/components/marketing/explore-page-hero";
import { ExploreDirectory } from "@/components/marketing/explore-directory";
import { PublicScheduleExploreSection } from "@/components/marketing/public-schedule-explore-section";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { countExploreDirectoryAcademies, countExploreDirectoryPlayers } from "@/lib/explore-demo-data";
import {
  emptyWeeklyCompetitionData,
  fetchWeeklyCompetitionData,
} from "@/lib/ideal-xi";
import {
  collectBirthDatesFromDirectory,
  getDefaultCategoryFilter,
} from "@/lib/player-category";
import { fetchPublicDirectory } from "@/lib/public-directory";
import { fetchPublicUpcomingMatches } from "@/lib/public-schedule";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { fetchTutorDirectoryPlayers } from "@/lib/tutor-directory";

export const metadata: Metadata = {
  title: "Explorar talento | MiFicha",
  description:
    "Directorio de jugadores: fichas de academia verificadas y fichas armadas por tutores. Filtra por categoría, posición y ciudad.",
};

export default async function ExplorarPage() {
  const [data, weeklyStats, upcomingMatches, tutorPlayers] = await Promise.all([
    fetchPublicDirectory().catch(() => ({ academies: [], players: [] })),
    fetchWeeklyCompetitionData().catch(() => emptyWeeklyCompetitionData()),
    fetchPublicUpcomingMatches().catch(() => []),
    (async () => {
      try {
        const admin = createSupabaseAdminClient();
        return await fetchTutorDirectoryPlayers(admin);
      } catch {
        return [];
      }
    })(),
  ]);

  const academySlugs = new Set(data.players.map((player) => player.slug));
  const mergedPlayers = [
    ...data.players,
    ...tutorPlayers.filter((player) => !academySlugs.has(player.slug)),
  ];
  const directory = { ...data, players: mergedPlayers };

  const playerCount = countExploreDirectoryPlayers(directory);
  const academyCount = countExploreDirectoryAcademies(directory);
  const weeklyActiveCount = weeklyStats.ranked.length;
  const initialCategoryFilter = getDefaultCategoryFilter(
    collectBirthDatesFromDirectory(directory.players, weeklyStats.performances),
  );

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />

      <main className="flex-1">
        <ExplorePageHero
          playerCount={playerCount}
          academyCount={academyCount}
          weeklyActiveCount={weeklyActiveCount}
          weekLabel={weeklyStats.weekLabel}
        />

        <PublicScheduleExploreSection matches={upcomingMatches} />

        <section
          id="directorio"
          className="scroll-mt-20 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14"
        >
          <ExploreDirectory
            data={directory}
            weeklyPerformances={weeklyStats.performances}
            rankedPerformances={weeklyStats.ranked}
            risingPerformances={weeklyStats.rising}
            leaderboard={weeklyStats.leaderboard}
            weekLabel={weeklyStats.weekLabel}
            initialCategoryFilter={initialCategoryFilter}
          />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
