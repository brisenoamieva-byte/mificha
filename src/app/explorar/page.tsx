import type { Metadata } from "next";
import { ExplorePageHero } from "@/components/marketing/explore-page-hero";
import { ExploreDirectory } from "@/components/marketing/explore-directory";
import { PublicScheduleExploreSection } from "@/components/marketing/public-schedule-explore-section";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { countExploreDirectoryAcademies, countExploreDirectoryPlayers } from "@/lib/explore-demo-data";
import { fetchWeeklyCompetitionData } from "@/lib/ideal-xi";
import {
  collectBirthDatesFromDirectory,
  getDefaultCategoryFilter,
} from "@/lib/player-category";
import { fetchPublicDirectory } from "@/lib/public-directory";
import { fetchPublicUpcomingMatches } from "@/lib/public-schedule";

export const metadata: Metadata = {
  title: "Explorar talento | MiFicha",
  description:
    "Directorio de jugadores y academias con ficha verificada. Filtra por categoría, posición y ciudad.",
};

export default async function ExplorarPage() {
  const [data, weeklyStats, upcomingMatches] = await Promise.all([
    fetchPublicDirectory(),
    fetchWeeklyCompetitionData(),
    fetchPublicUpcomingMatches(),
  ]);

  const playerCount = countExploreDirectoryPlayers(data);
  const academyCount = countExploreDirectoryAcademies(data);
  const weeklyActiveCount = weeklyStats.ranked.length;
  const initialCategoryFilter = getDefaultCategoryFilter(
    collectBirthDatesFromDirectory(data.players, weeklyStats.performances),
  );

  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
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
            data={data}
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
